import * as fs from 'fs';
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    const userDataDir = path.resolve(__dirname, '../../.vscode-test/user-data');
    const extensionsDir = path.resolve(__dirname, '../../.vscode-test/extensions');
    const vscodeExecutablePath = findSystemVSCode();

    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--disable-extensions',
        '--disable-gpu',
        '--disable-workspace-trust',
        '--no-sandbox',
        '--skip-welcome',
        '--skip-release-notes',
        '--user-data-dir',
        userDataDir,
        '--extensions-dir',
        extensionsDir
      ]
    });
  } catch (error) {
    console.error('Failed to run tests');
    console.error(error);
    process.exit(1);
  }
}

void main();

function findSystemVSCode(): string | undefined {
  const candidates = [
    '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
    '/Applications/Visual Studio Code - Insiders.app/Contents/MacOS/Electron'
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}
