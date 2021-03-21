import test from 'ava';
import hre from 'hardhat';
import _rimraf from 'rimraf';
import { promisify } from 'util';

const rimraf = promisify(_rimraf);

import { writeGeneratedSources } from './generate/sources';

test('result compiles', async t => {
  await rimraf(hre.config.paths.sources);
  await writeGeneratedSources(hre.config.paths.sources);
  await hre.run('compile', { force: true });
  t.pass();
});
