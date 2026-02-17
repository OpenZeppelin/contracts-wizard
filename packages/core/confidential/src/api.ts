import type { CommonOptions } from './common-options';
import type { ERC7984Options } from './erc7984';
import { printERC7984, defaults as erc7984Defaults } from './erc7984';

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

export type ERC7984 = WizardContractAPI<ERC7984Options>;

export const erc7984: ERC7984 = {
  print: printERC7984,
  defaults: erc7984Defaults,
};
