import type { CommonContractOptions, CommonOptions } from './common-options';
import type { FungibleOptions } from './fungible';
import type { GovernorOptions } from './governor';
import type { NonFungibleOptions } from './non-fungible';
import type { StablecoinOptions } from './stablecoin';
import type { VaultOptions } from './vault';
import {
  printStablecoin,
  defaults as stablecoinDefaults,
  isAccessControlRequired as stablecoinIsAccessControlRequired,
} from './stablecoin';
import {
  printVault,
  defaults as vaultDefaults,
  isAccessControlRequired as vaultIsAccessControlRequired,
} from './vault';
import {
  printFungible,
  defaults as fungibledefaults,
  isAccessControlRequired as fungibleIsAccessControlRequired,
} from './fungible';
import {
  printGovernor,
  defaults as governorDefaults,
  isAccessControlRequired as governorIsAccessControlRequired,
} from './governor';
import {
  printNonFungible,
  defaults as nonFungibledefaults,
  isAccessControlRequired as nonFungibleIsAccessControlRequired,
} from './non-fungible';

export interface WizardContractAPI<Options extends CommonOptions> {
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

export type Fungible = WizardContractAPI<FungibleOptions> & AccessControlAPI<FungibleOptions>;
export type Governor = WizardContractAPI<GovernorOptions> & AccessControlAPI<GovernorOptions>;
export type NonFungible = WizardContractAPI<NonFungibleOptions> & AccessControlAPI<NonFungibleOptions>;
export type Stablecoin = WizardContractAPI<StablecoinOptions> & AccessControlAPI<StablecoinOptions>;
export type Vault = WizardContractAPI<VaultOptions> & AccessControlAPI<VaultOptions>;

export const fungible: Fungible = {
  print: printFungible,
  defaults: fungibledefaults,
  isAccessControlRequired: fungibleIsAccessControlRequired,
};

export const governor: Governor = {
  print: printGovernor,
  defaults: governorDefaults,
  isAccessControlRequired: governorIsAccessControlRequired,
};

export const nonFungible: NonFungible = {
  print: printNonFungible,
  defaults: nonFungibledefaults,
  isAccessControlRequired: nonFungibleIsAccessControlRequired,
};

export const stablecoin: Stablecoin = {
  print: printStablecoin,
  defaults: stablecoinDefaults,
  isAccessControlRequired: stablecoinIsAccessControlRequired,
};

export const vault: Vault = {
  print: printVault,
  defaults: vaultDefaults,
  isAccessControlRequired: vaultIsAccessControlRequired,
};
