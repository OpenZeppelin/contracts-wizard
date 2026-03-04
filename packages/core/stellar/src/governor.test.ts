import test from 'ava';

import type { GovernorOptions } from './governor';
import { buildGovernor } from './governor';
import { printContract } from './print';

import { governor } from '.';

function testGovernor(title: string, opts: Partial<GovernorOptions>) {
  test(title, t => {
    const c = buildGovernor({
      name: 'MyGovernor',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

function testAPIEquivalence(title: string, opts?: GovernorOptions) {
  test(title, t => {
    t.is(
      governor.print(opts),
      printContract(
        buildGovernor({
          name: 'MyGovernor',
          ...opts,
        }),
      ),
    );
  });
}

testGovernor('basic governor', {});

testGovernor('governor custom settings', {
  name: 'DAOGovernor',
  version: '2.1.0',
  votingDelay: '10',
  votingPeriod: '5000',
  proposalThreshold: '100',
  quorum: '500',
});

testAPIEquivalence('governor API default');

testAPIEquivalence('governor API custom', {
  name: 'DAOGovernor',
  version: '2.1.0',
  votingDelay: '10',
  votingPeriod: '5000',
  proposalThreshold: '100',
  quorum: '500',
});

test('governor API assert defaults', async t => {
  t.is(governor.print(governor.defaults), governor.print());
});
