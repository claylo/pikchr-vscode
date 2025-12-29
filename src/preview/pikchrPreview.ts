import * as vscode from 'vscode';
import type { PikchrRenderer } from '../pikchr/renderer';

class PikchrEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(private readonly renderer: PikchrRenderer) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: false
    };

    const updateWebview = async () => {
      try {
        const source = document.getText();
        const svgData = await this.renderer.render(source);
        const svgContent = Buffer.from(svgData).toString('utf-8');

        webviewPanel.webview.html = this.getHtmlForWebview(svgContent);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        webviewPanel.webview.html = this.getErrorHtml(errorMessage);
      }
    };

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        updateWebview();
      }
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    await updateWebview();
  }

  private getHtmlForWebview(svgContent: string): string {
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
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
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

  private getErrorHtml(errorMessage: string): string {
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
    <pre>${this.escapeHtml(errorMessage)}</pre>
  </div>
</body>
</html>`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export function registerPikchrPreview(
  context: vscode.ExtensionContext,
  renderer: PikchrRenderer
): void {
  const provider = new PikchrEditorProvider(renderer);
  const registration = vscode.window.registerCustomEditorProvider(
    'pikchr.preview',
    provider,
    {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }
  );

  context.subscriptions.push(registration);
}
