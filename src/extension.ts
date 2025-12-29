import * as vscode from 'vscode';
import { registerPikchrIntegrations } from './integrations';

export function activate(_context: vscode.ExtensionContext): void {
  registerPikchrIntegrations(_context);
}

export function deactivate(): void {
  // No-op for now.
}
