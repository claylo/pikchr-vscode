import * as vscode from 'vscode';
import { registerPikchrIntegrations } from './integrations';

export function activate(context: vscode.ExtensionContext): any {
  return registerPikchrIntegrations(context);
}

export function deactivate(): void {
  // No-op for now.
}
