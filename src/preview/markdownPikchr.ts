import * as vscode from 'vscode';
import type { PikchrRenderer } from '../pikchr/renderer';

export function registerMarkdownPikchr(
  context: vscode.ExtensionContext,
  _renderer: PikchrRenderer
): void {
  const disposable = new vscode.Disposable(() => {
    // Placeholder for Markdown-it renderer teardown.
  });

  context.subscriptions.push(disposable);
}
