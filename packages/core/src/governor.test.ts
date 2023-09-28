import test from 'ava';
import { governor } from '.';

import { buildGovernor, GovernorOptions } from './governor';
import { printContract } from './print';

function testGovernor(title: string, opts: Partial<GovernorOptions>) {
  test(title, t => {
    const c = buildGovernor({
      name: 'MyGovernor',
      delay: '1 week',
      period: '1 week',
      settings: false,
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
    t.is(governor.print(opts), printContract(buildGovernor({
      name: 'MyGovernor',
      delay: '1 day',
      period: '1 week',
      ...opts,
    })));
  });
}

testGovernor('governor with proposal threshold', {
  proposalThreshold: '1',
});

testGovernor('governor with custom block time', {
  blockTime: 6,
});

testGovernor('governor with custom decimals', {
  decimals: 6,
  proposalThreshold: '1',
  quorumMode: 'absolute',
  quorumAbsolute: '1',
});

testGovernor('governor with 0 decimals', {
  decimals: 0,
  proposalThreshold: '1',
  quorumMode: 'absolute',
  quorumAbsolute: '1',
});

testGovernor('governor with settings', {
  settings: true,
  proposalThreshold: '1',
});

testGovernor('governor with erc20votes', {
  votes: 'erc20votes',
});

testGovernor('governor with erc721votes', {
  votes: 'erc721votes',
});

testGovernor('governor with erc721votes omit decimals', {
  votes: 'erc721votes',
  decimals: 6,
  proposalThreshold: '1',
  quorumMode: 'absolute',
  quorumAbsolute: '5',
});

testGovernor('governor with erc721votes settings omit decimals', {
  votes: 'erc721votes',
  decimals: 6,
  proposalThreshold: '10',
  settings: true,
});

testGovernor('governor with percent quorum', {
  quorumMode: 'percent',
  quorumPercent: 6,
});

testGovernor('governor with fractional percent quorum', {
  quorumMode: 'percent',
  quorumPercent: 0.5,
});

testGovernor('governor with openzeppelin timelock', {
  timelock: 'openzeppelin',
});

testGovernor('governor with compound timelock', {
  timelock: 'compound',
});

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: 'CustomGovernor', delay: '2 weeks', period: '2 week' });

testAPIEquivalence('API basic upgradeable', { name: 'CustomGovernor', delay: '2 weeks', period: '2 week', upgradeable: 'uups' });

test('API assert defaults', async t => {
  t.is(governor.print(governor.defaults), governor.print());
});

test('API isAccessControlRequired', async t => {
  t.is(governor.isAccessControlRequired({ upgradeable: 'uups' }), true);
  t.is(governor.isAccessControlRequired({}), false);
});