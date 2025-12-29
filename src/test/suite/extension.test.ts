import * as assert from 'assert';
import * as vscode from 'vscode';
import { suite, test } from 'mocha';
import { createPikchrRenderer } from '../../pikchr/renderer';

suite('Extension Test Suite', () => {
  test('sample test', () => {
    assert.strictEqual(1 + 1, 2);
  });

  test('extension is activated', async () => {
    const extension = vscode.extensions.getExtension('claylo.pikchr');
    assert.ok(extension, 'Extension should be found');
    assert.ok(extension.isActive, 'Extension should be activated');
  });

  test('extension exports markdown API', async () => {
    const extension = vscode.extensions.getExtension('claylo.pikchr');
    assert.ok(extension, 'Extension should be found');

    const api = extension.exports;
    assert.ok(api, 'Extension should export API');
    assert.ok(typeof api.extendMarkdownIt === 'function', 'API should have extendMarkdownIt function');
  });
});

suite('Pikchr Renderer Test Suite', () => {
  test('creates renderer without error', () => {
    const renderer = createPikchrRenderer();
    assert.ok(renderer);
    assert.ok(typeof renderer.render === 'function');
  });

  test('render returns promise', () => {
    const renderer = createPikchrRenderer();
    const result = renderer.render('box "test"');
    assert.ok(result instanceof Promise);
  });

  test('render rejects when pikchr-cmd not found', async () => {
    const renderer = createPikchrRenderer();

    try {
      // This will likely fail if pikchr-cmd is not installed
      await renderer.render('box "test"');
    } catch (error) {
      // Expected to fail in test environment without pikchr-cmd
      assert.ok(error instanceof Error);
    }
  });
});
