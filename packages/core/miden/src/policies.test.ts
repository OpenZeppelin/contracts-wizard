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
