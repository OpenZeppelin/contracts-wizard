import test from 'ava';
import { governor } from '.';

import type { GovernorOptions } from './governor';
import { buildGovernor, formatQuorumAbsolute } from './governor';
import { OptionsError } from './error';
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
    t.is(
      governor.print(opts),
      printContract(
        buildGovernor({
          name: 'MyGovernor',
          delay: '1 day',
          period: '1 week',
          ...opts,
        }),
      ),
    );
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

testGovernor('governor with storage', {
  storage: true,
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

testGovernor('governor with blocknumber, updatable settings', {
  clockMode: 'blocknumber',
  delay: '1 day',
  period: '2 weeks',
  settings: true,
});

testGovernor('governor with blocknumber, non-updatable settings', {
  clockMode: 'blocknumber',
  delay: '1 block',
  period: '2 weeks',
  settings: false,
});

testGovernor('governor with timestamp clock mode, updatable settings', {
  clockMode: 'timestamp',
  delay: '1 day',
  period: '2 weeks',
  settings: true,
});

testGovernor('governor with timestamp clock mode, non-updatable settings', {
  clockMode: 'timestamp',
  delay: '1 day',
  period: '2 weeks',
  settings: false,
});

testGovernor('governor with erc20votes, upgradable', {
  votes: 'erc20votes',
  upgradeable: 'uups',
});

testGovernor('governor with crossChainExecution', {
  crossChainExecution: true,
});

testGovernor('governor with crossChainExecution, no timelock', {
  crossChainExecution: true,
  timelock: false,
});

testGovernor('governor with crossChainExecution, storage, settings', {
  crossChainExecution: true,
  storage: true,
  settings: true,
});

testGovernor('governor with crossChainExecution, upgradable', {
  crossChainExecution: true,
  upgradeable: 'uups',
});

testAPIEquivalence('API default');

testAPIEquivalence('API basic', {
  name: 'CustomGovernor',
  delay: '2 weeks',
  period: '2 week',
});

testAPIEquivalence('API basic upgradeable', {
  name: 'CustomGovernor',
  delay: '2 weeks',
  period: '2 week',
  upgradeable: 'uups',
});

test('API assert defaults', async t => {
  t.is(governor.print(governor.defaults), governor.print());
});

test('API isAccessControlRequired', async t => {
  t.is(governor.isAccessControlRequired({ upgradeable: 'uups' }), false);
  t.is(governor.isAccessControlRequired({}), false);
});


test('formatQuorumAbsolute folds scientific notation into token decimals', t => {
  t.is(formatQuorumAbsolute({ quorumAbsolute: '1e3', decimals: 18, votes: 'erc20votes' }), '1e21');
  t.is(formatQuorumAbsolute({ quorumAbsolute: '1', decimals: 18, votes: 'erc20votes' }), '1e18');
  t.is(formatQuorumAbsolute({ quorumAbsolute: '010', decimals: 18, votes: 'erc20votes' }), '10e18');
  t.is(formatQuorumAbsolute({ quorumAbsolute: '0.5', decimals: 18, votes: 'erc20votes' }), '5e17');
});

test('formatQuorumAbsolute strips leading zeros for whole-vote quorums', t => {
  t.is(formatQuorumAbsolute({ quorumAbsolute: '010', decimals: 0, votes: 'erc20votes' }), '10');
  t.is(formatQuorumAbsolute({ quorumAbsolute: '1e3', decimals: 0, votes: 'erc20votes' }), '1000');
  t.is(formatQuorumAbsolute({ quorumAbsolute: '5', decimals: 0, votes: 'erc721votes' }), '5');
});

test('formatQuorumAbsolute rejects fractional whole-vote quorums', t => {
  const error = t.throws(
    () => formatQuorumAbsolute({ quorumAbsolute: '1.5', decimals: 0, votes: 'erc721votes' }),
    { instanceOf: OptionsError },
  );
  t.is((error as OptionsError).messages.quorumAbsolute, 'Too many decimals');
});

test('formatQuorumAbsolute rejects invalid numbers', t => {
  const error = t.throws(
    () => formatQuorumAbsolute({ quorumAbsolute: 'abc', decimals: 18, votes: 'erc20votes' }),
    { instanceOf: OptionsError },
  );
  t.is((error as OptionsError).messages.quorumAbsolute, 'Not a valid number');
});
