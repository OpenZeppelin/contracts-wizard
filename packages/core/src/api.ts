import type { CommonOptions } from './common-options';
import { printERC20, defaults as erc20defaults, ERC20Options } from './erc20';
import { printERC721, defaults as erc721defaults, ERC721Options } from './erc721';
import { printERC1155, defaults as erc1155defaults, ERC1155Options } from './erc1155';
import { printGovernor, defaults as governorDefaults, GovernorOptions } from './governor';

export interface WizardContractAPI {
  /**
   * Returns a string representation of a contract generated using the provided options. If opts is not provided, uses `defaults`.
   */
  print: (opts?: any) => string,
  
  /**
   * The default options that are used for `print`.
   */
  defaults: CommonOptions;
}

export interface ERC20 extends WizardContractAPI {
  defaults: Required<ERC20Options>;
}
export interface ERC721 extends WizardContractAPI {
  defaults: Required<ERC721Options>;
}
export interface ERC1155 extends WizardContractAPI {
  defaults: Required<ERC1155Options>;
}
export interface Governor extends WizardContractAPI {
  defaults: Required<GovernorOptions>;
}

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