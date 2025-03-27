import test from 'ava';
import { governor } from '.';

import type { GovernorOptions } from './governor';
import { buildGovernor } from './governor';
import { printContract } from './print';

const NAME = 'MyGovernor';

function testGovernor(title: string, opts: Partial<GovernorOptions>) {
  test(title, t => {
    const c = buildGovernor({
      name: NAME,
      delay: '1 day',
      period: '1 week',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: GovernorOptions) {
  test(title, t => {
    t.is(
      governor.print(opts),
      printContract(
        buildGovernor({
          name: NAME,
          delay: '1 day',
          period: '1 week',
          ...opts,
        }),
      ),
    );
  });
}

testGovernor('basic + upgradeable', {
  upgradeable: true,
});

testGovernor('basic non-upgradeable', {
  upgradeable: false,
});

testGovernor('erc20 votes + timelock', {
  votes: 'erc20votes',
  timelock: 'openzeppelin',
});

testGovernor('erc721 votes + timelock', {
  votes: 'erc721votes',
  timelock: 'openzeppelin',
});

testGovernor('custom name', {
  name: 'CustomGovernor',
});

testGovernor('custom settings', {
  delay: '2 hours',
  period: '1 year',
  proposalThreshold: '300',
  settings: true,
});

testGovernor('quorum mode absolute', {
  quorumMode: 'absolute',
  quorumAbsolute: '200',
});

testGovernor('quorum mode percent', {
  quorumMode: 'percent',
  quorumPercent: 40,
});

testGovernor('custom snip12 metadata', {
  appName: 'Governor',
  appVersion: 'v3',
});

testGovernor('all options', {
  name: NAME,
  delay: '4 day',
  period: '4 week',
  proposalThreshold: '500',
  decimals: 10,
  quorumMode: 'absolute',
  quorumPercent: 50,
  quorumAbsolute: '200',
  votes: 'erc721votes',
  clockMode: 'timestamp',
  timelock: 'openzeppelin',
  settings: true,
  appName: 'MyApp2',
  appVersion: 'v5',
  upgradeable: true,
});

testAPIEquivalence('API basic + upgradeable', {
  name: NAME,
  delay: '1 day',
  period: '1 week',
  upgradeable: true,
});

testAPIEquivalence('API basic non-upgradeable', {
  name: NAME,
  delay: '1 day',
  period: '1 week',
  upgradeable: false,
});

testAPIEquivalence('API erc20 votes + timelock', {
  name: NAME,
  delay: '1 day',
  period: '1 week',
  votes: 'erc20votes',
  timelock: 'openzeppelin',
});

testAPIEquivalence('API erc721 votes + timelock', {
  name: NAME,
  delay: '1 day',
  period: '1 week',
  votes: 'erc721votes',
  timelock: 'openzeppelin',
});

testAPIEquivalence('API custom name', {
  name: 'CustomGovernor',
  delay: '1 day',
  period: '1 week',
});

testAPIEquivalence('API custom settings', {
  name: NAME,
  delay: '2 hours',
  period: '1 year',
  proposalThreshold: '300',
  settings: true,
});

testAPIEquivalence('API quorum mode absolute', {
  name: NAME,
  delay: '1 day',
  period: '1 week',
  quorumMode: 'absolute',
  quorumAbsolute: '200',
});

testAPIEquivalence('API quorum mode percent', {
  name: NAME,
  delay: '1 day',
  period: '1 week',
  quorumMode: 'percent',
  quorumPercent: 40,
});

testAPIEquivalence('API custom snip12 metadata', {
  name: NAME,
  delay: '1 day',
  period: '1 week',
  appName: 'Governor',
  appVersion: 'v3',
});

testAPIEquivalence('API all options', {
  name: NAME,
  delay: '4 day',
  period: '4 week',
  proposalThreshold: '500',
  decimals: 10,
  quorumMode: 'absolute',
  quorumPercent: 50,
  quorumAbsolute: '200',
  votes: 'erc721votes',
  clockMode: 'timestamp',
  timelock: 'openzeppelin',
  settings: true,
  appName: 'MyApp2',
  appVersion: 'v5',
  upgradeable: true,
});
