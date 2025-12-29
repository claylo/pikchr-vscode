import { spawn } from 'child_process';

export interface PikchrRenderer {
  render(source: string): Promise<Uint8Array>;
}

export function createPikchrRenderer(): PikchrRenderer {
  return {
    async render(source: string): Promise<Uint8Array> {
      return new Promise((resolve, reject) => {
        const process = spawn('pikchr-cmd', ['--svg-only']);

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
              'pikchr-cmd not found. Please install pikchr-cmd and ensure it is in your PATH.'
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
  };
}
