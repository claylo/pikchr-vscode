import * as vscode from 'vscode';
import { createPikchrRenderer } from './pikchr/renderer';
import { registerMarkdownPikchr } from './preview/markdownPikchr';
import { registerPikchrPreview } from './preview/pikchrPreview';

export function registerPikchrIntegrations(
  context: vscode.ExtensionContext
): any {
  const renderer = createPikchrRenderer();

  registerPikchrPreview(context, renderer);
  const markdownExtension = registerMarkdownPikchr(context, renderer);

  // Return the markdown-it extension for VS Code to use
  return markdownExtension;
}
