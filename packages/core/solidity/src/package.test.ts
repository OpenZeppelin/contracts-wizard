import test from 'ava';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

async function packPackage(): Promise<string> {
  const packageRoot = join(__dirname, '..');
  const { stdout: packOutput } = await execAsync('npm pack', { cwd: packageRoot });
  // npm pack outputs the filename as the last line
  const lines = packOutput.trim().split('\n');
  const packedFile = lines[lines.length - 1]?.trim();
  if (!packedFile) {
    throw new Error('Failed to get packed filename from npm pack output');
  }
  return join(packageRoot, packedFile);
}

let packedPath: string | undefined;

test.before(async () => {
  packedPath = await packPackage();
});

test.after.always(async () => {
  if (packedPath) {
    await rm(packedPath, { force: true });
  }
});

test('packed package can be installed and imported with node', async t => {
  const tempDir = await mkdtemp(join(tmpdir(), 'wizard-package-test-'));

  try {
    if (!packedPath) {
      throw new Error('Packed path was not initialized');
    }

    // Create a test project in temp directory
    await execAsync('npm init -y', { cwd: tempDir });

    // Install the packed package
    await execAsync(`npm install "${packedPath}"`, { cwd: tempDir });

    // Test that the package can be imported
    const testScript = `const { erc20 } = require('@openzeppelin/wizard');
console.log('SUCCESS');
`;

    const testScriptPath = join(tempDir, 'test.js');
    await writeFile(testScriptPath, testScript);
    const { stdout } = await execAsync('node test.js', { cwd: tempDir });

    t.true(stdout.includes('SUCCESS'));
  } finally {
    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('packed package can be bundled with webpack', async t => {
  const tempDir = await mkdtemp(join(tmpdir(), 'wizard-webpack-test-'));

  try {
    if (!packedPath) {
      throw new Error('Packed path was not initialized');
    }

    await execAsync('npm init -y', { cwd: tempDir });
    await execAsync(`npm install "${packedPath}"`, { cwd: tempDir });
    await execAsync('npm install webpack webpack-cli', { cwd: tempDir });

    const entryScript = `const { erc20 } = require('@openzeppelin/wizard');
console.log(erc20.getVersionedRemappings({}));
`;
    await writeFile(join(tempDir, 'index.js'), entryScript);

    const webpackConfig = `const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js'],
  },
};
`;
    await writeFile(join(tempDir, 'webpack.config.js'), webpackConfig);

    await execAsync('npx webpack --config webpack.config.js', { cwd: tempDir });

    t.pass();
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
