import type { CommonContractOptions } from './common-options';
import type { FungibleOptions } from './fungible';
import { printFungible, defaults as fungibledefaults } from './fungible';

export interface WizardContractAPI<Options extends CommonContractOptions> {
  /**
   * Returns a string representation of a contract generated using the provided options. If opts is not provided, uses `defaults`.
   */
  print: (opts?: Options) => string;

  /**
   * The default options that are used for `print`.
   */
  defaults: Required<Options>;
}

export interface AccessControlAPI<Options extends CommonContractOptions> {
  /**
   * Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the
   * same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`.
   */
  isAccessControlRequired: (opts: Partial<Options>) => boolean;
}

export type Fungible = WizardContractAPI<FungibleOptions>; // TODO add AccessControlAPI<FungibleOptions> when access control is implemented, if useful

export const fungible: Fungible = {
  print: printFungible,
  defaults: fungibledefaults,
};
