import type { CommonOptions } from './common-options';
import { printERC20, defaults as erc20defaults, ERC20Options } from './erc20';
import { printERC721, defaults as erc721defaults, ERC721Options } from './erc721';

export interface WizardContractAPI<Options extends CommonOptions> {
  /**
   * Returns a string representation of a contract generated using the provided options. If opts is not provided, uses `defaults`.
   */
  print: (opts?: Options) => string,
  
  /**
   * The default options that are used for `print`.
   */
  defaults: Required<Options>;
}

export type ERC20 = WizardContractAPI<ERC20Options>;
export type ERC721 = WizardContractAPI<ERC721Options>;

export const erc20: ERC20 = {
  print: printERC20,
  defaults: erc20defaults
}
export const erc721 = {
  print: printERC721,
  defaults: erc721defaults
}