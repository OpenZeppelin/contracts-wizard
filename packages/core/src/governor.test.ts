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

testGovernor('governor with comp', {
  votes: 'comp',
  quorumMode: 'absolute',
  quorumAbsolute: '1',
});

testGovernor('governor with percent quorum', {
  quorumMode: 'percent',
  quorumPercent: 6,
});

testGovernor('governor with openzeppelin timelock', {
  timelock: 'openzeppelin',
});

testGovernor('governor with compound timelock', {
  timelock: 'compound',
});
