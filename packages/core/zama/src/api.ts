import type { CommonOptions } from './common-options';
import type { ConfidentialFungibleOptions } from './confidentialFungible';
import {
  printConfidentialFungible,
  defaults as confidentialFungibleDefaults,
} from './confidentialFungible';

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

export type ConfidentialFungible = WizardContractAPI<ConfidentialFungibleOptions>;

export const confidentialFungible: ConfidentialFungible = {
  print: printConfidentialFungible,
  defaults: confidentialFungibleDefaults,
};