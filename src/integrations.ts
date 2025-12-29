import * as vscode from 'vscode';
import { createPikchrRenderer } from './pikchr/renderer';
import { registerMarkdownPikchr } from './preview/markdownPikchr';
import { registerPikchrPreview } from './preview/pikchrPreview';

export function registerPikchrIntegrations(
  context: vscode.ExtensionContext
): void {
  const renderer = createPikchrRenderer();

  registerPikchrPreview(context, renderer);
  registerMarkdownPikchr(context, renderer);
}
