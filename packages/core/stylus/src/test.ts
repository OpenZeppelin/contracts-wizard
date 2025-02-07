import { promises as fs } from 'fs';
import os from 'os';
import _test, { TestFn, ExecutionContext } from 'ava';
import path from 'path';

import { writeGeneratedSources } from './generate/sources';
import type { KindedOptions } from './build-generic';

interface Context {
  generatedSourcesPath: string
}

const test = _test as TestFn<Context>;

test.serial('erc20 result generated', async t => {
  await testGenerate(t, 'ERC20');
});

async function testGenerate(t: ExecutionContext<Context>, kind: keyof KindedOptions) {
  const generatedSourcesPath = path.join(os.tmpdir(), 'oz-wizard-stylus');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await writeGeneratedSources(generatedSourcesPath, true, kind);

  t.pass();
}
