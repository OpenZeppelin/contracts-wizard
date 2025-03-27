import { promises as fs } from 'fs';
import os from 'os';
import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import path from 'path';

import type { KindSubset } from './generate/sources';
import { generateSources, writeGeneratedSources } from './generate/sources';
import type { GenericOptions } from './build-generic';
import { custom, erc20, erc721, erc1155 } from './api';
import type { RoyaltyInfoSubset } from './set-royalty-info';

interface Context {
  generatedSourcesPath: string;
}

const test = _test as TestFn<Context>;

test.serial('erc20 results generated', async ctx => {
  await testGenerate({ ctx, kind: 'ERC20' });
});

test.serial('erc721 results generated', async ctx => {
  await testGenerate({ ctx, kind: 'ERC721', royaltyInfo: 'all' });
});

test.serial('erc1155 results generated', async ctx => {
  await testGenerate({ ctx, kind: 'ERC1155', royaltyInfo: 'all' });
});

test.serial('account results generated', async ctx => {
  await testGenerate({ ctx, kind: 'Account' });
});

test.serial('vesting results generated', async ctx => {
  await testGenerate({ ctx, kind: 'Vesting' });
});

test.serial('governor results generated', async ctx => {
  await testGenerate({ ctx, kind: 'Governor' });
});

test.serial('custom results generated', async ctx => {
  await testGenerate({ ctx, kind: 'Custom' });
});

async function testGenerate(params: {
  ctx: ExecutionContext<Context>;
  kind: KindSubset;
  royaltyInfo?: RoyaltyInfoSubset;
}) {
  const { ctx, kind, royaltyInfo } = params;
  const generatedSourcesPath = path.join(os.tmpdir(), 'oz-wizard-cairo');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await writeGeneratedSources({
    dir: generatedSourcesPath,
    subset: 'all',
    uniqueName: true,
    kind,
    royaltyInfo: royaltyInfo || 'all',
    logsEnabled: false,
  });

  ctx.pass();
}

function isAccessControlRequired(opts: GenericOptions) {
  const kind = opts.kind;
  switch (kind) {
    case 'ERC20':
      return erc20.isAccessControlRequired(opts);
    case 'ERC721':
      return erc721.isAccessControlRequired(opts);
    case 'ERC1155':
      return erc1155.isAccessControlRequired(opts);
    case 'Custom':
      return custom.isAccessControlRequired(opts);
    case 'Account':
      throw new Error('Not applicable for accounts');
    case 'Governor':
      throw new Error('Not applicable for Governor');
    case 'Vesting':
      throw new Error('Not applicable for Vesting');
    default: {
      const _: never = kind;
      throw new Error(`No such kind: ${kind}`);
    }
  }
}

test('is access control required', async t => {
  const allSources = generateSources({
    subset: 'all',
    uniqueName: false,
    kind: 'all',
    royaltyInfo: 'all',
  });
  for (const contract of allSources) {
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
