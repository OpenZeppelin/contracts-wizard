import type { CommonOptions } from './common-options';
import type { ERC20Options } from './erc20';
import {
  printERC20,
  defaults as erc20defaults,
} from './erc20';

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

export type ERC20 = WizardContractAPI<ERC20Options>;

export const erc20: ERC20 = {
  print: printERC20,
  defaults: erc20defaults,
};