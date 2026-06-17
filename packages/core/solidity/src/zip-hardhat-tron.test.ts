import type { ExecutionContext } from 'ava';
import test from 'ava';

import { zipHardhatTron } from './zip-hardhat-tron';

import { buildERC20 } from './erc20';
import { buildERC721 } from './erc721';
import { buildERC1155 } from './erc1155';
import { buildGovernor } from './governor';
import type { Contract } from './contract';
import type { JSZipObject } from 'jszip';
import type JSZip from 'jszip';
import type { GenericOptions } from './build-generic';

// The TRON download cannot run `npm install` end-to-end yet because
// @openzeppelin/hardhat-tron and @openzeppelin/tron-contracts are not
// published to npm at the time of this test. These tests therefore only
// verify the file layout and snapshot the contents.

test.serial('erc20 basic - layout & contents', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
  };
  const c = buildERC20(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('erc20 full (mintable, pausable, permit, votes, flashmint)', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
    premint: '2000',
    access: 'roles',
    burnable: true,
    mintable: true,
    pausable: true,
    permit: true,
    votes: true,
    flashmint: true,
  };
  const c = buildERC20(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('erc721 basic', async t => {
  const opts: GenericOptions = {
    kind: 'ERC721',
    name: 'My NFT',
    symbol: 'MNFT',
  };
  const c = buildERC721(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('erc1155 basic', async t => {
  const opts: GenericOptions = {
    kind: 'ERC1155',
    name: 'My Multi',
    uri: 'ipfs://example/{id}',
  };
  const c = buildERC1155(opts);
  await runSnapshotTest(c, t, opts);
});

// Upgradeable contracts deploy behind a manually-deployed proxy (the OZ Upgrades
// plugins don't target TRON), so the project also ships a `contracts/Proxy.sol`.
test.serial('erc20 uups upgradeable - proxy deploy scaffolding', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
    mintable: true,
    access: 'ownable',
    upgradeable: 'uups',
  };
  const c = buildERC20(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('erc20 transparent upgradeable - proxy deploy scaffolding', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
    mintable: true,
    access: 'ownable',
    upgradeable: 'transparent',
  };
  const c = buildERC20(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('governor uups upgradeable - non-address init args are gated', async t => {
  const opts: GenericOptions = {
    kind: 'Governor',
    name: 'My Governor',
    delay: '1 day',
    period: '1 week',
    votes: 'erc20votes',
    timelock: 'openzeppelin',
    upgradeable: 'uups',
  };
  const c = buildGovernor(opts);
  await runSnapshotTest(c, t, opts);
});

async function runSnapshotTest(c: Contract, t: ExecutionContext, opts: GenericOptions) {
  const zip = await zipHardhatTron(c, opts);

  assertLayout(zip, c, t);
  await assertContents(zip, c, t);
}

function assertLayout(zip: JSZip, c: Contract, t: ExecutionContext) {
  const sorted = Object.keys(zip.files).sort();
  const expected = [
    '.gitignore',
    'README.md',
    'contracts/',
    `contracts/${c.name}.sol`,
    ...(c.upgradeable ? ['contracts/Proxy.sol'] : []),
    'hardhat.config.ts',
    'package.json',
    'scripts/',
    'scripts/deploy.ts',
    'test/',
    'test/test.ts',
    'tsconfig.json',
  ].sort();
  t.deepEqual(sorted, expected);
}

async function assertContents(zip: JSZip, c: Contract, t: ExecutionContext) {
  const contentComparison = [
    await getItemString(zip, `contracts/${c.name}.sol`),
    ...(c.upgradeable ? [await getItemString(zip, 'contracts/Proxy.sol')] : []),
    await getItemString(zip, 'hardhat.config.ts'),
    await getItemString(zip, 'package.json'),
    await getItemString(zip, 'scripts/deploy.ts'),
    await getItemString(zip, 'test/test.ts'),
    await getItemString(zip, 'README.md'),
    await getItemString(zip, '.gitignore'),
  ];

  t.snapshot(contentComparison);
}

async function getItemString(zip: JSZip, key: string) {
  const obj = zip.files[key];
  if (obj === undefined) {
    throw Error(`Item ${key} not found in zip`);
  }
  return `${key}:\n${await asString(obj)}`;
}

async function asString(item: JSZipObject) {
  return Buffer.from(await item.async('arraybuffer')).toString();
}
