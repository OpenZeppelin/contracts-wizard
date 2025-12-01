import test from 'ava';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

async function packPackage(packageRoot: string): Promise<string> {
  const { stdout: packOutput } = await execAsync('npm pack', { cwd: packageRoot });
  // npm pack outputs the filename as the last line
  const lines = packOutput.trim().split('\n');
  const packedFile = lines[lines.length - 1]?.trim();
  if (!packedFile) {
    throw new Error('Failed to get packed filename from npm pack output');
  }
  return join(packageRoot, packedFile);
}

test('packed package can be installed and imported', async t => {
  const packageRoot = join(__dirname, '..');
  const tempDir = await mkdtemp(join(tmpdir(), 'wizard-package-test-'));

  try {
    // Pack the package
    const packedPath = await packPackage(packageRoot);

    try {
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
      // Clean up the packed file
      await rm(packedPath, { force: true });
    }
  } finally {
    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });
  }
});
