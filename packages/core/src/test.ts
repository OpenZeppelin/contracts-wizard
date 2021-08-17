import test from 'ava';
import hre from 'hardhat';
import { promisify } from 'util';
import path from 'path';

import { writeGeneratedSources } from './generate/sources';

test('result compiles', async t => {
  const generatedSourcesPath = path.join(hre.config.paths.sources, 'generated');
  await writeGeneratedSources(generatedSourcesPath, 'all');
  await hre.run('compile');
  t.pass();
});
