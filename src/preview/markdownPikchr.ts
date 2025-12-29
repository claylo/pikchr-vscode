import * as vscode from 'vscode';
import type { PikchrRenderer } from '../pikchr/renderer';

// Global WASM renderer instance for markdown (synchronous usage)
let wasmRenderer: any = null;

export function registerMarkdownPikchr(
  context: vscode.ExtensionContext,
  renderer: PikchrRenderer
): { extendMarkdownIt: (md: any) => any } {
  // Pre-initialize WASM renderer for markdown
  initWasmForMarkdown();

  return {
    extendMarkdownIt(md: any) {
      const defaultFence = md.renderer.rules.fence;

      md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx];
        const info = token.info.trim();
        const language = info.split(/\s+/)[0];

        if (language === 'pikchr') {
          const source = token.content;

          try {
            const config = vscode.workspace.getConfiguration('pikchr');
            const backend = config.get<string>('renderer', 'wasm');

            let svgData: string;

            if (backend === 'wasm' && wasmRenderer) {
              // Use WASM renderer (synchronous)
              svgData = wasmRenderer.render(source);
            } else {
              // Fall back to command-line renderer (synchronous)
              const { execFileSync } = require('child_process');
              const commandPath = config.get<string>('commandPath', '');

              let command: string;
              let args: string[];

              if (backend === 'pikchr-cmd') {
                command = commandPath || 'pikchr-cmd';
                args = ['-b', '-C']; // bare mode, current color
              } else {
                command = commandPath || 'pikchr';
                args = [];
              }

              svgData = execFileSync(command, args, {
                input: source,
                encoding: 'utf-8',
                maxBuffer: 10 * 1024 * 1024
              });
            }

            return `<div class="pikchr-diagram">${svgData}</div>`;
          } catch (error: any) {
            let errorMessage = 'Unknown error';

            if (error.code === 'ENOENT') {
              const config = vscode.workspace.getConfiguration('pikchr');
              const backend = config.get<string>('renderer', 'wasm');
              errorMessage = `${backend} not found. Please install it or switch to WASM renderer in settings.`;
            } else if (error.stderr) {
              errorMessage = error.stderr.toString();
            } else if (error.message) {
              errorMessage = error.message;
            }

            return `<div class="pikchr-error" style="color: #f48771; padding: 8px; border: 1px solid #f48771; border-radius: 4px; background-color: rgba(244, 135, 113, 0.1); margin: 8px 0;">
              <strong>Pikchr Error:</strong>
              <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 4px 0;">${escapeHtml(errorMessage)}</pre>
            </div>`;
          }
        }

        return defaultFence(tokens, idx, options, env, self);
      };

      return md;
    }
  };
}

async function initWasmForMarkdown(): Promise<void> {
  try {
    const pikchrWasm = require('pikchr-wasm-kindone');
    wasmRenderer = pikchrWasm.default || pikchrWasm;
    await wasmRenderer.loadWASM();
  } catch (error) {
    console.warn('Failed to initialize WASM for markdown:', error);
    // Fall back to command-line renderer
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
