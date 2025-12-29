import * as vscode from 'vscode';
import type { PikchrRenderer } from '../pikchr/renderer';

export function registerPikchrPreview(
  context: vscode.ExtensionContext,
  _renderer: PikchrRenderer
): void {
  const disposable = new vscode.Disposable(() => {
    // Placeholder for preview provider teardown.
  });

  context.subscriptions.push(disposable);
}
