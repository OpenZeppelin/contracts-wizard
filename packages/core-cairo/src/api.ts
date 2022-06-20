import type { CommonOptions } from './common-options';
import { printERC20, defaults as erc20defaults, isAccessControlRequired as erc20IsAccessControlRequired, ERC20Options, getInitialSupply } from './erc20';
import { printERC721, defaults as erc721defaults, isAccessControlRequired as erc721IsAccessControlRequired, ERC721Options } from './erc721';
import { printGeneral, defaults as generalDefaults, isAccessControlRequired as generalIsAccessControlRequired, GeneralOptions } from './general';
import { toUint256 } from './utils/uint256';

export interface WizardContractAPI<Options extends CommonOptions> {
  /**
   * Returns a string representation of a contract generated using the provided options. If opts is not provided, uses `defaults`.
   */
  print: (opts?: Options) => string,
  
  /**
   * The default options that are used for `print`.
   */
  defaults: Required<Options>;

  /**
   * Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the 
   * same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`. 
   */
   isAccessControlRequired: (opts: Partial<Options>) => boolean,
}

export type ERC20 = WizardContractAPI<ERC20Options> & {
  /**
   * Calculates the initial supply that would be used in an ERC20 contract based on a given premint amount and number of decimals.
   */
   getInitialSupply: (premint: string, decimals: number) => string;
}
export type ERC721 = WizardContractAPI<ERC721Options>;
export type General = WizardContractAPI<GeneralOptions>;

export const erc20: ERC20 = {
  print: printERC20,
  defaults: erc20defaults,
  isAccessControlRequired: erc20IsAccessControlRequired,
  getInitialSupply
}
export const erc721: ERC721 = {
  print: printERC721,
  defaults: erc721defaults,
  isAccessControlRequired: erc721IsAccessControlRequired
}
export const general: General = {
  print: printGeneral,
  defaults: generalDefaults,
  isAccessControlRequired: generalIsAccessControlRequired
}
export const utils = {
  toUint256
}