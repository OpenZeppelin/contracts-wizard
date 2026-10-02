import test from 'ava';

import type { GenericOptions } from './build-generic';
import { buildGeneric } from './build-generic';
import { accessOptions, transferPolicyOptions } from './common-options';
import { fungibleBurnPolicyOptions } from './fungible';
import { nonFungibleBurnPolicyOptions } from './non-fungible';
import { printContract } from './print';

const booleans = [false, true];

function* policyOptions(): Generator<GenericOptions> {
  for (const access of accessOptions) {
    for (const pausable of booleans) {
      for (const pausableTransfers of booleans) {
        for (const transferPolicy of transferPolicyOptions) {
          for (const switchableTransferPolicy of booleans) {
            const common = { name: 'MyToken', symbol: 'MTK', access, pausable, pausableTransfers, transferPolicy };
            for (const burnPolicy of fungibleBurnPolicyOptions) {
              const minBurnAmount = burnPolicy === 'minimumAmount' ? '1' : '';
              yield { kind: 'Fungible', ...common, burnPolicy, minBurnAmount, switchableTransferPolicy };
            }
            for (const burnPolicy of nonFungibleBurnPolicyOptions) {
              yield { kind: 'NonFungible', ...common, burnPolicy, switchableTransferPolicy };
            }
          }
        }
      }
    }
  }
}

// Switchable Transfer Policy pre-approves transfer policies only. Pre-approving a mint or burn policy would give
// privileged accounts a switch they do not need, such as opening minting to anyone on a network faucet.
test('no option pre-approves a mint or burn policy', t => {
  for (const opts of policyOptions()) {
    const source = printContract(buildGeneric(opts));
    t.false(source.includes('allowed_mint_policy'), `mint policy pre-approved for ${JSON.stringify(opts)}`);
    t.false(source.includes('allowed_burn_policy'), `burn policy pre-approved for ${JSON.stringify(opts)}`);
  }
});

// Whoever can set fees can make every note, including the config notes that would undo it, too expensive to send. So
// setting fees stays with the top authority (the owner, or `ADMIN` under Roles) instead of a role that `ADMIN` could
// not take back once fees are out of reach.
test('no role is dedicated to setting fees', t => {
  for (const opts of policyOptions()) {
    const source = printContract(buildGeneric(opts));
    t.false(source.includes('set_note_fee_root'), `fee setter mapped to a role for ${JSON.stringify(opts)}`);
  }
});

// Under Roles, every role the faucet uses gets an initial member from `create`, as the Solidity Wizard grants each role
// to a constructor argument. Otherwise nobody could pause or manage the lists until `ADMIN` granted the roles.
test('every role used by a Roles faucet gets an initial member', t => {
  for (const opts of policyOptions()) {
    if (opts.access !== 'roles') continue;
    const source = printContract(buildGeneric(opts));
    for (const [, constant] of source.matchAll(/pub const (\w+)_ROLE: /g)) {
      const member = constant!.toLowerCase();
      t.true(
        source.includes(`.with_member(${member})`),
        `${constant} has no initial member for ${JSON.stringify(opts)}`,
      );
    }
  }
});
