import test from 'ava';
import hre from 'hardhat';
import _rimraf from 'rimraf';
import { promisify } from 'util';
import path from 'path';

const rimraf = promisify(_rimraf);

import { writeGeneratedSources } from './generate/sources';

test('result compiles', async t => {
  const generatedSourcesPath = path.join(hre.config.paths.sources, 'generated');
  await rimraf(generatedSourcesPath);
  await writeGeneratedSources(generatedSourcesPath);
  await hre.run('compile', { force: true });
  t.pass();
});
