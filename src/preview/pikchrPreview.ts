import * as vscode from 'vscode';
import type { PikchrRenderer } from '../pikchr/renderer';

const previewPanels = new Map<string, vscode.WebviewPanel>();

export function registerPikchrPreview(
  context: vscode.ExtensionContext,
  renderer: PikchrRenderer
): void {
  // Register command to open preview
  const openPreviewCommand = vscode.commands.registerCommand('pikchr.openPreview', async (uri?: vscode.Uri) => {
    const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
    if (!targetUri) {
      return;
    }

    await openPreview(targetUri, renderer, context);
  });

  // Auto-open preview when opening .pikchr files
  const openTextDocumentHandler = vscode.workspace.onDidOpenTextDocument(async document => {
    if (document.languageId === 'pikchr') {
      const config = vscode.workspace.getConfiguration('pikchr.preview');
      const autoOpen = config.get<boolean>('autoOpen', true);

      if (autoOpen) {
        await openPreview(document.uri, renderer, context);
      }
    }
  });

  context.subscriptions.push(openPreviewCommand, openTextDocumentHandler);
}

async function openPreview(
  uri: vscode.Uri,
  renderer: PikchrRenderer,
  context: vscode.ExtensionContext
): Promise<void> {
  const uriString = uri.toString();

  // Reuse existing panel if available
  if (previewPanels.has(uriString)) {
    const panel = previewPanels.get(uriString)!;
    panel.reveal();
    return;
  }

  const config = vscode.workspace.getConfiguration('pikchr.preview');
  const splitView = config.get<boolean>('splitView', true);

  // Create webview panel
  const panel = vscode.window.createWebviewPanel(
    'pikchrPreview',
    `Preview: ${getFileName(uri)}`,
    {
      viewColumn: splitView ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
      preserveFocus: splitView
    },
    {
      enableScripts: false,
      retainContextWhenHidden: true
    }
  );

  previewPanels.set(uriString, panel);

  // Update preview content
  const updatePreview = async () => {
    try {
      const document = await vscode.workspace.openTextDocument(uri);
      const source = document.getText();
      const svgData = await renderer.render(source);
      const svgContent = Buffer.from(svgData).toString('utf-8');

      panel.webview.html = getHtmlForWebview(svgContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      panel.webview.html = getErrorHtml(errorMessage);
    }
  };

  // Listen for document changes
  const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
    if (e.document.uri.toString() === uriString) {
      updatePreview();
    }
  });

  // Listen for document saves
  const saveDocumentSubscription = vscode.workspace.onDidSaveTextDocument(document => {
    if (document.uri.toString() === uriString) {
      updatePreview();
    }
  });

  // Cleanup on dispose
  panel.onDidDispose(() => {
    previewPanels.delete(uriString);
    changeDocumentSubscription.dispose();
    saveDocumentSubscription.dispose();
  });

  // Initial render
  await updatePreview();
}

function getFileName(uri: vscode.Uri): string {
  const path = uri.path.split('/');
  return path[path.length - 1];
}

function getHtmlForWebview(svgContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pikchr Preview</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: white;
      color: black;
    }
    svg {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;
}

function getErrorHtml(errorMessage: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pikchr Error</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
    }
    .error {
      color: var(--vscode-errorForeground);
      padding: 16px;
      border: 1px solid var(--vscode-errorBorder);
      border-radius: 4px;
      background-color: var(--vscode-inputValidation-errorBackground);
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="error">
    <strong>Error rendering Pikchr diagram:</strong>
    <pre>${escapeHtml(errorMessage)}</pre>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
