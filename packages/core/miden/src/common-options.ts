import type { Info } from './set-info';
import { defaults as infoDefaults } from './set-info';

export const accessOptions = ['singleKey', 'ownable', 'roles'] as const;

/**
 * Who controls the faucet.
 *
 * - `'singleKey'`: the faucet is a user account run by one key holder, who signs every transaction of the faucet itself.
 * - `'ownable'`: the faucet is a network account managed by an owner account authorized for all privileged actions,
 *   including minting. Ownership can be transferred in two steps.
 * - `'roles'`: the faucet is a network account with role-based access control. Minting is done by the faucet
 *   owner, initially the admin.
 */
export type Access = (typeof accessOptions)[number];

/** Access control used when the selected options need an owner but `'singleKey'` was requested. */
export const DEFAULT_ACCESS_CONTROL = 'ownable';

export const transferPolicyOptions = [false, 'allowlist', 'blocklist'] as const;

/**
 * Transfer policy enforced on both the send and the receive side of every transfer.
 */
export type TransferPolicy = (typeof transferPolicyOptions)[number];

export const defaults: Required<CommonOptions> = {
  info: infoDefaults,
} as const;

export const contractDefaults: Required<CommonContractOptions> = {
  ...defaults,
  access: 'ownable',
} as const;

export interface CommonOptions {
  info?: Info;
}

export interface CommonContractOptions extends CommonOptions {
  access?: Access;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    info: opts.info ?? defaults.info,
  };
}

export function withCommonContractDefaults(opts: CommonContractOptions): Required<CommonContractOptions> {
  return {
    ...withCommonDefaults(opts),
    access: opts.access ?? contractDefaults.access,
  };
}
