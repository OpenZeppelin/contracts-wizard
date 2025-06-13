import type { CommonOptions } from './common-options';
import type { ERC20Options } from './erc20';
import {
  printERC20,
  defaults as erc20defaults,
  isAccessControlRequired as erc20IsAccessControlRequired,
} from './erc20';
import type { ERC721Options } from './erc721';
import {
  printERC721,
  defaults as erc721defaults,
  isAccessControlRequired as erc721IsAccessControlRequired,
} from './erc721';
import type { ERC1155Options } from './erc1155';
import {
  printERC1155,
  defaults as erc1155defaults,
  isAccessControlRequired as erc1155IsAccessControlRequired,
} from './erc1155';
import type { StablecoinOptions } from './stablecoin';
import {
  printStablecoin,
  defaults as stablecoinDefaults,
  isAccessControlRequired as stablecoinIsAccessControlRequired,
} from './stablecoin';
import type { AccountOptions } from './account';
import { printAccount, defaults as accountDefaults } from './account';
import type { ERC7579Options } from './erc7579';
import { printERC7579, defaults as erc7579Defaults } from './erc7579';
import type { GovernorOptions } from './governor';
import {
  printGovernor,
  defaults as governorDefaults,
  isAccessControlRequired as governorIsAccessControlRequired,
} from './governor';
import type { CustomOptions } from './custom';
import {
  printCustom,
  defaults as customDefaults,
  isAccessControlRequired as customIsAccessControlRequired,
} from './custom';

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

export interface AccessControlAPI<Options extends CommonOptions> {
  /**
   * Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the
   * same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`.
   */
  isAccessControlRequired: (opts: Partial<Options>) => boolean;
}

export type ERC20 = WizardContractAPI<ERC20Options> & AccessControlAPI<ERC20Options>;
export type ERC721 = WizardContractAPI<ERC721Options> & AccessControlAPI<ERC721Options>;
export type ERC1155 = WizardContractAPI<ERC1155Options> & AccessControlAPI<ERC1155Options>;
export type Stablecoin = WizardContractAPI<StablecoinOptions> & AccessControlAPI<StablecoinOptions>;
export type RealWorldAsset = WizardContractAPI<StablecoinOptions> & AccessControlAPI<StablecoinOptions>;
export type Account = WizardContractAPI<AccountOptions>;
export type ERC7579 = WizardContractAPI<ERC7579Options>;
export type Governor = WizardContractAPI<GovernorOptions> & AccessControlAPI<GovernorOptions>;
export type Custom = WizardContractAPI<CustomOptions> & AccessControlAPI<CustomOptions>;

export const erc20: ERC20 = {
  print: printERC20,
  defaults: erc20defaults,
  isAccessControlRequired: erc20IsAccessControlRequired,
};
export const erc721: ERC721 = {
  print: printERC721,
  defaults: erc721defaults,
  isAccessControlRequired: erc721IsAccessControlRequired,
};
export const erc1155: ERC1155 = {
  print: printERC1155,
  defaults: erc1155defaults,
  isAccessControlRequired: erc1155IsAccessControlRequired,
};
export const stablecoin: Stablecoin = {
  print: printStablecoin,
  defaults: stablecoinDefaults,
  isAccessControlRequired: stablecoinIsAccessControlRequired,
};
export const account: Account = {
  print: printAccount,
  defaults: accountDefaults,
};
export const erc7579: ERC7579 = {
  print: printERC7579,
  defaults: erc7579Defaults,
};
export const realWorldAsset: RealWorldAsset = {
  print: printStablecoin,
  defaults: stablecoinDefaults,
  isAccessControlRequired: stablecoinIsAccessControlRequired,
};
export const governor: Governor = {
  print: printGovernor,
  defaults: governorDefaults,
  isAccessControlRequired: governorIsAccessControlRequired,
};
export const custom: Custom = {
  print: printCustom,
  defaults: customDefaults,
  isAccessControlRequired: customIsAccessControlRequired,
};
