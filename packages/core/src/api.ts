import type { CommonOptions } from './common-options';
import { printERC20, defaults as erc20defaults, ERC20Options } from './erc20';
import { printERC721, defaults as erc721defaults, ERC721Options } from './erc721';
import { printERC1155, defaults as erc1155defaults, ERC1155Options } from './erc1155';
import { printGovernor, defaults as governorDefaults, GovernorOptions } from './governor';
import { printGeneral, defaults as generalDefaults, GeneralOptions } from './general';

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
export type ERC1155 = WizardContractAPI<ERC1155Options>;
export type Governor = WizardContractAPI<GovernorOptions>;
export type General = WizardContractAPI<GeneralOptions>;

export const erc20: ERC20 = {
  print: printERC20,
  defaults: erc20defaults
}
export const erc721: ERC721 = {
  print: printERC721,
  defaults: erc721defaults
}
export const erc1155: ERC1155 = {
  print: printERC1155,
  defaults: erc1155defaults
}
export const governor: Governor = {
  print: printGovernor,
  defaults: governorDefaults
}
export const general: General = {
  print: printGeneral,
  defaults: generalDefaults
}