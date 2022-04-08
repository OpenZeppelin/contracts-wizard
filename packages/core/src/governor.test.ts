import test from 'ava';

import { buildGovernor, defaults, GovernorOptions } from './governor';
import { printContract } from './print';

function testGovernor(title: string, opts: Partial<GovernorOptions>) {
  test(title, t => {
    const c = buildGovernor({
      ...defaults,
      name: 'MyGovernor',
      delay: '1 week',
      period: '1 week',
      settings: false,
      ...opts,
    });
    t.snapshot(printContract(c));
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

testGovernor('governor with bravo', {
  bravo: true,
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

testGovernor('governor with comp', {
  votes: 'comp',
  quorumMode: 'absolute',
  quorumAbsolute: '1',
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
