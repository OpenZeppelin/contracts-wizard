import { promises as fs } from 'fs';
import os from 'os';
import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import path from 'path';

import { generateSources, writeGeneratedSources } from './generate/sources';
import type { GenericOptions, KindedOptions } from './build-generic';
import { custom, erc20, erc721, erc1155 } from './api';

interface Context {
  generatedSourcesPath: string;
}

const test = _test as TestFn<Context>;

test.serial('erc20 result generated', async t => {
  await testGenerate(t, 'ERC20');
});

test.serial('erc721 result generated', async t => {
  await testGenerate(t, 'ERC721');
});

test.serial('erc1155 result generated', async t => {
  await testGenerate(t, 'ERC1155');
});

test.serial('account result generated', async t => {
  await testGenerate(t, 'Account');
});

test.serial('custom result generated', async t => {
  await testGenerate(t, 'Custom');
});

async function testGenerate(t: ExecutionContext<Context>, kind: keyof KindedOptions) {
  const generatedSourcesPath = path.join(os.tmpdir(), 'oz-wizard-cairo');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await writeGeneratedSources(generatedSourcesPath, 'all', true, kind);

  t.pass();
}

function isAccessControlRequired(opts: GenericOptions) {
  switch (opts.kind) {
    case 'ERC20':
      return erc20.isAccessControlRequired(opts);
    case 'ERC721':
      return erc721.isAccessControlRequired(opts);
    case 'ERC1155':
      return erc1155.isAccessControlRequired(opts);
    case 'Account':
      throw new Error('Not applicable for accounts');
    case 'Custom':
      return custom.isAccessControlRequired(opts);
    default:
      throw new Error('No such kind');
  }
}

test('is access control required', async t => {
  for (const contract of generateSources('all')) {
    const regexOwnable = /(use openzeppelin::access::ownable::OwnableComponent)/gm;

    switch (contract.options.kind) {
      case 'Account':
      case 'Governor':
      case 'Vesting':
        // These contracts have no access control option
        break;
      case 'ERC20':
      case 'ERC721':
      case 'ERC1155':
      case 'Custom':
        if (!contract.options.access) {
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
