import * as assert from 'assert';
import * as vscode from 'vscode';
import { suite, test } from 'mocha';
import { registerPikchrIntegrations } from '../../integrations';

suite('Extension Test Suite', () => {
  test('sample test', () => {
    assert.strictEqual(1 + 1, 2);
  });

  test('registers integration placeholders without error', () => {
    const context = { subscriptions: [] } as unknown as vscode.ExtensionContext;

    registerPikchrIntegrations(context);

    assert.strictEqual(context.subscriptions.length, 2);
  });
});
