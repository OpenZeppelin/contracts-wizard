import { promises as fs } from 'fs';
import os from 'os';
import _test, { TestFn, ExecutionContext } from 'ava';
import path from 'path';

import { generateSources, writeGeneratedSources } from './generate/sources';
import type { GenericOptions, KindedOptions } from './build-generic';
import { erc20, } from './api';

interface Context {
  generatedSourcesPath: string
}

const test = _test as TestFn<Context>;

test.serial('erc20 result generated', async t => {
  await testGenerate(t, 'ERC20');
});

async function testGenerate(t: ExecutionContext<Context>, kind: keyof KindedOptions) {
  const generatedSourcesPath = path.join(os.tmpdir(), 'oz-wizard-cairo');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await writeGeneratedSources(generatedSourcesPath, 'all', true, kind);

  t.pass();
}

function isAccessControlRequired(opts: GenericOptions) {
  switch(opts.kind) {
    case 'ERC20':
      return erc20.isAccessControlRequired(opts);
    default:
      throw new Error("No such kind");
  }
}

test('is access control required', async t => {
  for (const contract of generateSources('all')) {
    const regexOwnable = /(use openzeppelin::access::ownable::OwnableComponent)/gm;

    switch (contract.options.kind) {
      case 'ERC20':
        if (!contract.options.access) {
          if (isAccessControlRequired(contract.options)) {
            t.regex(contract.source, regexOwnable, JSON.stringify(contract.options));
          } else {
            t.notRegex(contract.source, regexOwnable, JSON.stringify(contract.options));
          }
        }
        break;
      default:
        const _: never = contract.options.kind; // TODO: When there are additional kinds above, change this assignment to just `contract.options` instead of `contract.options.kind`
        throw new Error('Unknown kind');
    }
  }
});
