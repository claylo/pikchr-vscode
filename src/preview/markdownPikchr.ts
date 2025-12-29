import * as vscode from 'vscode';
import type { PikchrRenderer } from '../pikchr/renderer';
import { execFile } from 'child_process';

export function registerMarkdownPikchr(
  context: vscode.ExtensionContext,
  renderer: PikchrRenderer
): { extendMarkdownIt: (md: any) => any } {
  return {
    extendMarkdownIt(md: any) {
      const defaultFence = md.renderer.rules.fence;

      md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx];
        const info = token.info.trim();

        if (info === 'pikchr') {
          const source = token.content;

          try {
            // Synchronous rendering using execFileSync for markdown-it compatibility
            const { execFileSync } = require('child_process');
            const svgData = execFileSync('pikchr-cmd', ['--svg-only'], {
              input: source,
              encoding: 'utf-8',
              maxBuffer: 10 * 1024 * 1024
            });

            return `<div class="pikchr-diagram">${svgData}</div>`;
          } catch (error: any) {
            let errorMessage = 'Unknown error';

            if (error.code === 'ENOENT') {
              errorMessage = 'pikchr-cmd not found. Please install pikchr-cmd and ensure it is in your PATH.';
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
