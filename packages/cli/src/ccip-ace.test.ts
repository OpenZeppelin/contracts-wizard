import test from 'ava';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { erc20, stablecoin, realWorldAsset, type ERC20Options } from '@openzeppelin/wizard';
import { z } from 'zod';
import { registry } from './registry';

const CLI = join(__dirname, '..', 'dist', 'index.js');
const base = { name: 'MyToken', symbol: 'MTK' };
const argv = ['--name', base.name, '--symbol', base.symbol];

for (const [command, print] of [
  ['solidity-erc20', erc20.print],
  ['solidity-stablecoin', stablecoin.print],
  ['solidity-rwa', realWorldAsset.print],
] as const) {
  for (const features of [
    {},
    { crossChainBridging: 'chainlink-ccip' },
    { chainlinkAce: true },
    { crossChainBridging: 'chainlink-ccip', chainlinkAce: true },
    { crossChainBridging: 'chainlink-ccip', burnable: true },
    { crossChainBridging: 'chainlink-ccip', burnable: true, chainlinkAce: true },
  ]) {
    test(`${command} CLI argv ${JSON.stringify(features)} matches public printer`, t => {
      const options = { ...base, ...features };
      const args = Object.entries(features).flatMap(([key, value]) => [`--${key}`, value]);
      const result = execFileSync(process.execPath, [CLI, command, ...argv, ...args], { encoding: 'utf8' });
      t.is(result.trimEnd(), print(options as ERC20Options).trimEnd());
    });
  }
}

test('TRON CLI registry schema does not advertise CCIP or ACE', t => {
  const schema = z.object(registry['tron-trc20'].schema);
  for (const features of [{ crossChainBridging: 'chainlink-ccip' }, { chainlinkAce: true }]) {
    t.false(schema.safeParse({ ...base, ...features }).success);
  }
});

for (const command of ['tron-trc20', 'solidity-stablecoin', 'solidity-rwa']) {
  const invalid =
    command === 'tron-trc20'
      ? [['--crossChainBridging', 'chainlink-ccip'], ['--chainlinkAce']]
      : [
          ['--chainlinkAce', '--upgradeable', 'uups'],
          ['--crossChainBridging', 'chainlink-ccip', '--upgradeable', 'transparent'],
        ];
  for (const args of invalid) {
    test(`${command} CLI rejects ${args.join(' ')}`, t => {
      const result = spawnSync(process.execPath, [CLI, command, ...argv, ...args], { encoding: 'utf8' });
      t.not(result.status, 0);
      t.is(result.stdout, '');
      t.true(result.stderr.length > 0);
    });
  }
}

const ACE_NOTICE = [
  '// Imports Chainlink ACE components licensed under BUSL-1.1.',
  '// License: https://github.com/smartcontractkit/chainlink-ace/blob/v1.2.0/LICENSE',
].join('\n');

for (const [command, print] of [
  ['solidity-erc20', erc20.print],
  ['solidity-stablecoin', stablecoin.print],
  ['solidity-rwa', realWorldAsset.print],
] as const) {
  for (const features of [{ chainlinkAce: true }, { crossChainBridging: 'chainlink-ccip', chainlinkAce: true }]) {
    for (const license of [undefined, 'MIT', 'Apache-2.0']) {
      test(`${command} CLI ${JSON.stringify(features)} license ${license ?? 'default'} prints BUSL-1.1`, t => {
        const args = Object.entries(features).flatMap(([key, value]) => [`--${key}`, String(value)]);
        const licenseArgs = license ? ['--info.license', license] : [];
        const result = execFileSync(process.execPath, [CLI, command, ...argv, ...args, ...licenseArgs], {
          encoding: 'utf8',
        });
        t.true(result.startsWith('// SPDX-License-Identifier: BUSL-1.1\n'));
        t.true(result.includes(ACE_NOTICE));
        const options = { ...base, ...features, ...(license ? { info: { license } } : {}) };
        t.is(result.trimEnd(), print(options as ERC20Options).trimEnd());
      });
    }
  }
  for (const features of [{}, { crossChainBridging: 'chainlink-ccip' }]) {
    for (const license of [undefined, 'Apache-2.0']) {
      test(`${command} CLI ${JSON.stringify(features)} license ${license ?? 'default'} keeps its license`, t => {
        const args = Object.entries(features).flatMap(([key, value]) => [`--${key}`, String(value)]);
        const licenseArgs = license ? ['--info.license', license] : [];
        const result = execFileSync(process.execPath, [CLI, command, ...argv, ...args, ...licenseArgs], {
          encoding: 'utf8',
        });
        t.true(result.startsWith(`// SPDX-License-Identifier: ${license ?? 'MIT'}\n`));
        t.false(result.includes('Chainlink ACE'));
      });
    }
  }
  test(`${command} CLI help explains the ACE license`, t => {
    const help = execFileSync(process.execPath, [CLI, command, '--help'], { encoding: 'utf8' });
    t.regex(help, /Enabling ACE makes the generated contract use BUSL-1\.1, overriding info\.license/);
    t.true(help.includes('https://github.com/smartcontractkit/chainlink-ace/blob/v1.2.0/chainlink-ace-License-grants'));
  });
}

test('TRON CLI help does not mention the ACE license', t => {
  const help = execFileSync(process.execPath, [CLI, 'tron-trc20', '--help'], { encoding: 'utf8' });
  t.false(help.includes('BUSL'));
});
