import { promises as fs } from 'fs';
import os from 'os';
import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import path from 'path';

import { generateSources, writeGeneratedSources } from './generate/sources';
import type { GenericOptions, KindedOptions } from './build-generic';
import { fungible, nonFungible } from './api';

interface Context {
  generatedSourcesPath: string;
}

const test = _test as TestFn<Context>;

test.serial('fungible result generated', async t => {
  await testGenerate(t, 'Fungible');
});

test.serial('non-fungible result generated', async t => {
  await testGenerate(t, 'NonFungible');
});

async function testGenerate(t: ExecutionContext<Context>, kind: keyof KindedOptions) {
  const generatedSourcesPath = path.join(os.tmpdir(), 'oz-wizard-miden');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await writeGeneratedSources(generatedSourcesPath, 'all', true, kind);

  t.pass();
}

function isAccessControlRequired(opts: GenericOptions) {
  switch (opts.kind) {
    case 'Fungible':
      return fungible.isAccessControlRequired(opts);
    case 'NonFungible':
      return nonFungible.isAccessControlRequired(opts);
    default:
      throw new Error('No such kind');
  }
}

test('is access control required', async t => {
  for (const contract of generateSources('all')) {
    const regexOwnable = /(use miden_standards::account::access::\{?[^;]*AccessControl)/gm;

    switch (contract.options.kind) {
      case 'Fungible':
      case 'NonFungible':
        // A Single Key faucet has no access control component, unless the options need an owner.
        if (contract.options.access === 'singleKey') {
          if (isAccessControlRequired(contract.options)) {
            t.regex(contract.source, regexOwnable, JSON.stringify(contract.options));
          } else {
            t.notRegex(contract.source, regexOwnable, JSON.stringify(contract.options));
          }
        }
        break;
      default: {
        const _: never = contract.options;
        throw new Error('Unknown kind');
      }
    }
  }
});

test('generated sources have unique use clauses and fit the line width', async t => {
  for (const contract of generateSources('all')) {
    const lines = contract.source.split('\n');
    for (const line of lines) {
      t.true(line.length <= 100, `Line exceeds 100 characters in ${JSON.stringify(contract.options)}:\n${line}`);
    }
    const useLines = lines.filter(line => line.startsWith('use '));
    t.is(new Set(useLines).size, useLines.length, JSON.stringify(contract.options));
  }
});
