import test from 'ava';
import hre from 'hardhat';
import { promisify } from 'util';
import path from 'path';

import { writeGeneratedSources } from './generate/sources';

test('result compiles', async t => {
  const generatedSourcesPath = path.join(hre.config.paths.sources, 'generated');
  await writeGeneratedSources(generatedSourcesPath, 'all');

  // We only want to check that contracts compile and we don't care about any
  // of the outputs. Setting empty outputSelection causes compilation to go a
  // lot faster and not run out of memory.
  for (const { settings } of hre.config.solidity.compilers) {
    settings.outputSelection = {};
  }

  await hre.run('compile');
  t.pass();
});
