import { spawn } from 'child_process';
import * as vscode from 'vscode';

export interface PikchrRenderer {
  render(source: string): Promise<Uint8Array>;
}

type RendererBackend = 'wasm' | 'pikchr-cmd' | 'pikchr';

let wasmRenderer: any = null;
let wasmInitialized = false;

async function initWasmRenderer(): Promise<void> {
  if (!wasmInitialized) {
    try {
      const pikchrWasm = require('pikchr-wasm-kindone');
      wasmRenderer = pikchrWasm.default || pikchrWasm;
      await wasmRenderer.loadWASM();
      wasmInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize WASM renderer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

async function renderWithWasm(source: string): Promise<Uint8Array> {
  await initWasmRenderer();
  const svg = wasmRenderer.render(source);
  return new Uint8Array(Buffer.from(svg, 'utf-8'));
}

async function renderWithCommand(source: string, command: string, args: string[]): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    process.stdout.on('data', (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });

    process.stderr.on('data', (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });

    process.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        reject(new Error(
          `${command} not found. Please install ${command} and ensure it is in your PATH, or set a custom path in settings.`
        ));
      } else {
        reject(error);
      }
    });

    process.on('close', (code: number | null) => {
      if (code === 0) {
        const stdout = Buffer.concat(stdoutChunks);
        resolve(new Uint8Array(stdout));
      } else {
        const stderr = Buffer.concat(stderrChunks).toString('utf-8');
        reject(new Error(`Pikchr rendering error: ${stderr || `Process exited with code ${code}`}`));
      }
    });

    // Write source to stdin and close it
    process.stdin.write(source);
    process.stdin.end();
  });
}

function getRendererConfig(): { backend: RendererBackend; commandPath: string } {
  const config = vscode.workspace.getConfiguration('pikchr');
  const backend = config.get<RendererBackend>('renderer', 'wasm');
  const commandPath = config.get<string>('commandPath', '');
  return { backend, commandPath };
}

export function createPikchrRenderer(): PikchrRenderer {
  return {
    async render(source: string): Promise<Uint8Array> {
      const { backend, commandPath } = getRendererConfig();

      try {
        switch (backend) {
          case 'wasm':
            return await renderWithWasm(source);

          case 'pikchr-cmd': {
            const command = commandPath || 'pikchr-cmd';
            // Use -b for bare mode (no wrapper div)
            // Use -C for current color support
            return await renderWithCommand(source, command, ['-b', '-C']);
          }

          case 'pikchr': {
            const command = commandPath || 'pikchr';
            // pikchr outputs SVG by default
            return await renderWithCommand(source, command, []);
          }

          default:
            throw new Error(`Unknown renderer backend: ${backend}`);
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unknown error during Pikchr rendering');
      }
    }
  };
}
