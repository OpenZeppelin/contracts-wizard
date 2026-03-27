import test from 'ava';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { erc20, erc721, erc1155, stablecoin, realWorldAsset, governor, account, custom } from '@openzeppelin/wizard';
import {
  erc20 as cairoErc20,
  erc721 as cairoErc721,
  erc1155 as cairoErc1155,
  account as cairoAccount,
  multisig as cairoMultisig,
  governor as cairoGovernor,
  vesting as cairoVesting,
  custom as cairoCustom,
} from '@openzeppelin/wizard-cairo';
import { fungible, nonFungible, stablecoin as stellarStablecoin } from '@openzeppelin/wizard-stellar';
import { erc20 as stylusErc20, erc721 as stylusErc721, erc1155 as stylusErc1155 } from '@openzeppelin/wizard-stylus';
import { erc7984 } from '@openzeppelin/wizard-confidential';
import { hooks } from '@openzeppelin/wizard-uniswap-hooks';

const CLI = join(__dirname, '..', 'dist', 'index.js');

function run(...args: string[]): string {
  return execFileSync('node', [CLI, ...args], { encoding: 'utf-8' });
}

// --- Solidity ---

test('solidity-erc20: basic', t => {
  const output = run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST' }));
});

test('solidity-erc20: most options', t => {
  const opts = {
    name: 'TestToken',
    symbol: 'TST',
    premint: '1000',
    access: 'roles' as const,
    burnable: true,
    mintable: true,
    pausable: true,
    permit: true,
    votes: 'blocknumber' as const,
    flashmint: true,
    upgradeable: 'uups' as const,
  };
  const output = run(
    'solidity-erc20',
    '--name', opts.name, '--symbol', opts.symbol,
    '--premint', opts.premint,
    '--access', opts.access,
    '--burnable', '--mintable', '--pausable',
    '--permit', '--flashmint',
    '--votes', opts.votes,
    '--upgradeable', opts.upgradeable,
  );
  t.is(output, erc20.print(opts));
});

test('solidity-erc721: most options', t => {
  const opts = {
    name: 'TestNFT',
    symbol: 'TNFT',
    baseUri: 'https://example.com/',
    enumerable: true,
    uriStorage: true,
    burnable: true,
    pausable: true,
    mintable: true,
    incremental: true,
    votes: 'blocknumber' as const,
    access: 'roles' as const,
    upgradeable: 'uups' as const,
  };
  const output = run(
    'solidity-erc721',
    '--name', opts.name, '--symbol', opts.symbol,
    '--baseUri', opts.baseUri,
    '--enumerable', '--uriStorage',
    '--burnable', '--pausable', '--mintable', '--incremental',
    '--votes', opts.votes,
    '--access', opts.access,
    '--upgradeable', opts.upgradeable,
  );
  t.is(output, erc721.print(opts));
});

test('solidity-erc1155: most options', t => {
  const opts = {
    name: 'TestMulti',
    uri: 'https://example.com/{id}',
    burnable: true,
    pausable: true,
    mintable: true,
    supply: true,
    updatableUri: true,
    access: 'roles' as const,
    upgradeable: 'uups' as const,
  };
  const output = run(
    'solidity-erc1155',
    '--name', opts.name, '--uri', opts.uri,
    '--burnable', '--pausable', '--mintable',
    '--supply', '--updatableUri',
    '--access', opts.access,
    '--upgradeable', opts.upgradeable,
  );
  t.is(output, erc1155.print(opts));
});

test('solidity-stablecoin: most options', t => {
  const opts = {
    name: 'TestStable',
    symbol: 'TSTB',
    premint: '1000000',
    access: 'roles' as const,
    burnable: true,
    mintable: true,
    pausable: true,
    permit: true,
    flashmint: true,
    restrictions: 'allowlist' as const,
    freezable: true,
  };
  const output = run(
    'solidity-stablecoin',
    '--name', opts.name, '--symbol', opts.symbol,
    '--premint', opts.premint,
    '--access', opts.access,
    '--burnable', '--mintable', '--pausable',
    '--permit', '--flashmint',
    '--restrictions', opts.restrictions,
    '--freezable',
  );
  t.is(output, stablecoin.print(opts));
});

test('solidity-governor: most options', t => {
  const opts = {
    name: 'TestGovernor',
    delay: '1 day',
    period: '1 week',
    votes: 'erc20votes' as const,
    clockMode: 'timestamp' as const,
    timelock: 'openzeppelin' as const,
    proposalThreshold: '1000',
    quorumMode: 'percent' as const,
    quorumPercent: 10,
    storage: true,
    settings: true,
    upgradeable: 'uups' as const,
  };
  const output = run(
    'solidity-governor',
    '--name', opts.name,
    '--delay', opts.delay,
    '--period', opts.period,
    '--votes', opts.votes,
    '--clockMode', opts.clockMode,
    '--timelock', opts.timelock,
    '--proposalThreshold', opts.proposalThreshold,
    '--quorumMode', opts.quorumMode,
    '--quorumPercent', String(opts.quorumPercent),
    '--storage', '--settings',
    '--upgradeable', opts.upgradeable,
  );
  t.is(output, governor.print(opts));
});

test('solidity-account: most options', t => {
  const opts = {
    name: 'TestAccount',
    signatureValidation: 'ERC7739' as const,
    ERC721Holder: true,
    ERC1155Holder: true,
    signer: 'P256' as const,
    batchedExecution: true,
    upgradeable: 'uups' as const,
  };
  const output = run(
    'solidity-account',
    '--name', opts.name,
    '--signatureValidation', opts.signatureValidation,
    '--ERC721Holder', '--ERC1155Holder',
    '--signer', opts.signer,
    '--batchedExecution',
    '--upgradeable', opts.upgradeable,
  );
  t.is(output, account.print(opts));
});

test('solidity-rwa: most options', t => {
  const opts = {
    name: 'TestRWA',
    symbol: 'TRWA',
    premint: '1000000',
    burnable: true,
    mintable: true,
    pausable: true,
    permit: true,
    access: 'roles' as const,
    restrictions: 'allowlist' as const,
    freezable: true,
  };
  const output = run(
    'solidity-rwa',
    '--name', opts.name, '--symbol', opts.symbol,
    '--premint', opts.premint,
    '--burnable', '--mintable', '--pausable',
    '--permit',
    '--access', opts.access,
    '--restrictions', opts.restrictions,
    '--freezable',
  );
  t.is(output, realWorldAsset.print(opts));
});

test('solidity-custom: most options', t => {
  const opts = {
    name: 'TestCustom',
    pausable: true,
    access: 'roles' as const,
    upgradeable: 'uups' as const,
  };
  const output = run(
    'solidity-custom',
    '--name', opts.name,
    '--pausable',
    '--access', opts.access,
    '--upgradeable', opts.upgradeable,
  );
  t.is(output, custom.print(opts));
});

// --- Cairo ---

test('cairo-erc20: basic', t => {
  const output = run('cairo-erc20', '--name', 'TestToken', '--symbol', 'TST');
  t.is(output, cairoErc20.print({ name: 'TestToken', symbol: 'TST' }));
});

test('cairo-erc20: most options', t => {
  const opts = {
    name: 'TestToken',
    symbol: 'TST',
    premint: '1000',
    burnable: true,
    mintable: true,
    pausable: true,
    votes: true,
    appName: 'TestApp',
    appVersion: 'v1',
    upgradeable: true,
  };
  const output = run(
    'cairo-erc20',
    '--name', opts.name, '--symbol', opts.symbol,
    '--premint', opts.premint,
    '--burnable', '--mintable', '--pausable',
    '--votes',
    '--appName', opts.appName, '--appVersion', opts.appVersion,
    '--upgradeable',
  );
  t.is(output, cairoErc20.print(opts));
});

test('cairo-erc20: access roles-dar', t => {
  const opts = {
    name: 'TestToken',
    symbol: 'TST',
    access: {
      type: 'roles-dar' as const,
      darInitialDelay: '1 day',
      darDefaultDelayIncrease: '1 day',
      darMaxTransferDelay: '2 day',
    },
  };
  const output = run(
    'cairo-erc20',
    '--name', opts.name, '--symbol', opts.symbol,
    '--access.type', 'roles-dar',
    '--access.darInitialDelay', '1 day',
    '--access.darDefaultDelayIncrease', '1 day',
    '--access.darMaxTransferDelay', '2 day',
  );
  t.is(output, cairoErc20.print(opts));
});

test('cairo-erc721: most options', t => {
  const opts = {
    name: 'TestNFT',
    symbol: 'TNFT',
    baseUri: 'https://example.com/',
    burnable: true,
    mintable: true,
    pausable: true,
    enumerable: true,
    votes: true,
    appName: 'TestApp',
    appVersion: 'v1',
    upgradeable: true,
  };
  const output = run(
    'cairo-erc721',
    '--name', opts.name, '--symbol', opts.symbol,
    '--baseUri', opts.baseUri,
    '--burnable', '--mintable', '--pausable',
    '--enumerable', '--votes',
    '--appName', opts.appName, '--appVersion', opts.appVersion,
    '--upgradeable',
  );
  t.is(output, cairoErc721.print(opts));
});

test('cairo-erc1155: most options', t => {
  const opts = {
    name: 'TestMulti',
    baseUri: 'https://example.com/{id}',
    burnable: true,
    mintable: true,
    pausable: true,
    updatableUri: true,
    upgradeable: true,
  };
  const output = run(
    'cairo-erc1155',
    '--name', opts.name,
    '--baseUri', opts.baseUri,
    '--burnable', '--mintable', '--pausable',
    '--updatableUri', '--upgradeable',
  );
  t.is(output, cairoErc1155.print(opts));
});

test('cairo-account: most options', t => {
  const opts = {
    name: 'TestAccount',
    type: 'stark' as const,
    declare: true,
    deploy: true,
    pubkey: true,
    outsideExecution: true,
    upgradeable: true,
  };
  const output = run(
    'cairo-account',
    '--name', opts.name,
    '--type', opts.type,
    '--declare', '--deploy', '--pubkey',
    '--outsideExecution', '--upgradeable',
  );
  t.is(output, cairoAccount.print(opts));
});

test('cairo-governor: most options', t => {
  const opts = {
    name: 'TestGovernor',
    delay: '1 day',
    period: '1 week',
    votes: 'erc20votes' as const,
    clockMode: 'timestamp' as const,
    timelock: 'openzeppelin' as const,
    proposalThreshold: '100',
    quorumMode: 'percent' as const,
    quorumPercent: 10,
    settings: true,
    upgradeable: true,
    appName: 'TestApp',
    appVersion: 'v1',
  };
  const output = run(
    'cairo-governor',
    '--name', opts.name,
    '--delay', opts.delay,
    '--period', opts.period,
    '--votes', opts.votes,
    '--clockMode', opts.clockMode,
    '--timelock', opts.timelock,
    '--proposalThreshold', opts.proposalThreshold,
    '--quorumMode', opts.quorumMode,
    '--quorumPercent', String(opts.quorumPercent),
    '--settings', '--upgradeable',
    '--appName', opts.appName, '--appVersion', opts.appVersion,
  );
  t.is(output, cairoGovernor.print(opts));
});

test('cairo-multisig: most options', t => {
  const opts = {
    name: 'TestMultisig',
    quorum: '3',
    upgradeable: true,
  };
  const output = run(
    'cairo-multisig',
    '--name', opts.name,
    '--quorum', opts.quorum,
    '--upgradeable',
  );
  t.is(output, cairoMultisig.print(opts));
});

test('cairo-vesting: most options', t => {
  const opts = {
    name: 'TestVesting',
    startDate: '2025-01-01',
    duration: '30 day',
    cliffDuration: '7 day',
    schedule: 'linear' as const,
  };
  const output = run(
    'cairo-vesting',
    '--name', opts.name,
    '--startDate', opts.startDate,
    '--duration', opts.duration,
    '--cliffDuration', opts.cliffDuration,
    '--schedule', opts.schedule,
  );
  t.is(output, cairoVesting.print(opts));
});

test('cairo-custom: most options', t => {
  const opts = {
    name: 'TestCustom',
    pausable: true,
    upgradeable: true,
  };
  const output = run(
    'cairo-custom',
    '--name', opts.name,
    '--pausable', '--upgradeable',
  );
  t.is(output, cairoCustom.print(opts));
});

// --- Stellar ---

test('stellar-fungible: basic', t => {
  const output = run('stellar-fungible', '--name', 'TestToken', '--symbol', 'TST');
  t.is(output, fungible.print({ name: 'TestToken', symbol: 'TST' }));
});

test('stellar-fungible: most options', t => {
  const opts = {
    name: 'TestToken',
    symbol: 'TST',
    premint: '1000',
    burnable: true,
    mintable: true,
    pausable: true,
    access: 'roles' as const,
    upgradeable: true,
  };
  const output = run(
    'stellar-fungible',
    '--name', opts.name, '--symbol', opts.symbol,
    '--premint', opts.premint,
    '--burnable', '--mintable', '--pausable',
    '--access', opts.access,
    '--upgradeable',
  );
  t.is(output, fungible.print(opts));
});

test('stellar-stablecoin: most options', t => {
  const opts = {
    name: 'TestStable',
    symbol: 'TSTB',
    premint: '1000000',
    burnable: true,
    mintable: true,
    pausable: true,
    access: 'roles' as const,
    upgradeable: true,
    limitations: 'allowlist' as const,
  };
  const output = run(
    'stellar-stablecoin',
    '--name', opts.name, '--symbol', opts.symbol,
    '--premint', opts.premint,
    '--burnable', '--mintable', '--pausable',
    '--access', opts.access,
    '--upgradeable',
    '--limitations', opts.limitations,
  );
  t.is(output, stellarStablecoin.print(opts));
});

test('stellar-non-fungible: most options', t => {
  const opts = {
    name: 'TestNFT',
    symbol: 'TNFT',
    tokenUri: 'https://example.com/',
    burnable: true,
    enumerable: true,
    pausable: true,
    mintable: true,
    sequential: true,
    access: 'roles' as const,
    upgradeable: true,
  };
  const output = run(
    'stellar-non-fungible',
    '--name', opts.name, '--symbol', opts.symbol,
    '--tokenUri', opts.tokenUri,
    '--burnable', '--enumerable', '--pausable',
    '--mintable', '--sequential',
    '--access', opts.access,
    '--upgradeable',
  );
  t.is(output, nonFungible.print(opts));
});

// --- Stylus ---

test('stylus-erc20: basic', t => {
  const output = run('stylus-erc20', '--name', 'TestToken');
  t.is(output, stylusErc20.print({ name: 'TestToken' }));
});

test('stylus-erc20: most options', t => {
  const opts = {
    name: 'TestToken',
    burnable: true,
    permit: true,
    flashmint: true,
  };
  const output = run(
    'stylus-erc20',
    '--name', opts.name,
    '--burnable', '--permit', '--flashmint',
  );
  t.is(output, stylusErc20.print(opts));
});

test('stylus-erc721: most options', t => {
  const opts = {
    name: 'TestNFT',
    burnable: true,
    enumerable: true,
  };
  const output = run(
    'stylus-erc721',
    '--name', opts.name,
    '--burnable', '--enumerable',
  );
  t.is(output, stylusErc721.print(opts));
});

test('stylus-erc1155: most options', t => {
  const opts = {
    name: 'TestMulti',
    burnable: true,
    supply: true,
  };
  const output = run(
    'stylus-erc1155',
    '--name', opts.name,
    '--burnable', '--supply',
  );
  t.is(output, stylusErc1155.print(opts));
});

// --- Confidential ---

test('confidential-erc7984: basic', t => {
  const output = run('confidential-erc7984', '--name', 'TestToken', '--symbol', 'TST', '--contractURI', 'https://example.com', '--networkConfig', 'zama-ethereum');
  t.is(output, erc7984.print({ name: 'TestToken', symbol: 'TST', contractURI: 'https://example.com', networkConfig: 'zama-ethereum' }));
});

test('confidential-erc7984: most options', t => {
  const opts = {
    name: 'TestToken',
    symbol: 'TST',
    contractURI: 'https://example.com',
    networkConfig: 'zama-ethereum' as const,
    premint: '1000',
    wrappable: true,
    votes: 'blocknumber' as const,
  };
  const output = run(
    'confidential-erc7984',
    '--name', opts.name, '--symbol', opts.symbol,
    '--contractURI', opts.contractURI,
    '--networkConfig', opts.networkConfig,
    '--premint', opts.premint,
    '--wrappable',
    '--votes', opts.votes,
  );
  t.is(output, erc7984.print(opts));
});

// --- Uniswap Hooks ---

test('uniswap-hooks: most options', t => {
  const opts = {
    hook: 'BaseHook' as const,
    name: 'TestHook',
    pausable: true,
    currencySettler: true,
    safeCast: true,
    transientStorage: true,
    shares: { options: 'ERC20' as const, name: 'TestShare', symbol: 'TS' },
    permissions: {
      beforeInitialize: true,
      afterInitialize: false,
      beforeAddLiquidity: false,
      beforeRemoveLiquidity: false,
      afterAddLiquidity: false,
      afterRemoveLiquidity: false,
      beforeSwap: true,
      afterSwap: false,
      beforeDonate: false,
      afterDonate: false,
      beforeSwapReturnDelta: false,
      afterSwapReturnDelta: false,
      afterAddLiquidityReturnDelta: false,
      afterRemoveLiquidityReturnDelta: false,
    },
    inputs: { blockNumberOffset: 0, maxAbsTickDelta: 0 },
    access: 'roles' as const,
  };
  const output = run(
    'uniswap-hooks',
    '--hook', opts.hook,
    '--name', opts.name,
    '--pausable', '--currencySettler', '--safeCast', '--transientStorage',
    '--shares.options', 'ERC20',
    '--shares.name', opts.shares.name,
    '--shares.symbol', opts.shares.symbol,
    '--permissions.beforeInitialize',
    '--permissions.afterInitialize', 'false',
    '--permissions.beforeAddLiquidity', 'false',
    '--permissions.beforeRemoveLiquidity', 'false',
    '--permissions.afterAddLiquidity', 'false',
    '--permissions.afterRemoveLiquidity', 'false',
    '--permissions.beforeSwap',
    '--permissions.afterSwap', 'false',
    '--permissions.beforeDonate', 'false',
    '--permissions.afterDonate', 'false',
    '--permissions.beforeSwapReturnDelta', 'false',
    '--permissions.afterSwapReturnDelta', 'false',
    '--permissions.afterAddLiquidityReturnDelta', 'false',
    '--permissions.afterRemoveLiquidityReturnDelta', 'false',
    '--inputs.blockNumberOffset', '0',
    '--inputs.maxAbsTickDelta', '0',
    '--access', opts.access,
  );
  t.is(output, hooks.print(opts));
});
