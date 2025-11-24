import { promises as fs } from 'fs';
import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import hre from 'hardhat';
import path from 'path';

import { writeGeneratedSources } from './generate/sources';
import type { KindedOptions } from './build-generic';

interface Context {
  generatedSourcesPath: string;
}

const test = _test as TestFn<Context>;

test.serial('erc7984 result compiles', async t => {
  await testCompile(t, 'ERC7984');
});

async function testCompile(t: ExecutionContext<Context>, kind: keyof KindedOptions) {
  const generatedSourcesPath = path.join(hre.config.paths.sources, `generated`);
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await writeGeneratedSources(generatedSourcesPath, 'all', kind);

  // We only want to check that contracts compile and we don't care about any
  // of the outputs. Setting empty outputSelection causes compilation to go a
  // lot faster and not run out of memory.
  for (const { settings } of hre.config.solidity.compilers) {
    settings.outputSelection = {};
  }

  await hre.run('compile');
  t.pass();
}
