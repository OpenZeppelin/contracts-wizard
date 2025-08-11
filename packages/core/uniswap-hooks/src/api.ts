import type { CommonOptions } from '@openzeppelin/wizard/src/common-options';

import {
  printHooks,
  defaults as hooksDefaults,
  isAccessControlRequired as hooksIsAccessControlRequired,
} from './hooks';
import type { HooksOptions } from './hooks';

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

export type Hooks = WizardContractAPI<HooksOptions> & AccessControlAPI<HooksOptions>;

export const hooks: Hooks = {
  print: printHooks,
  defaults: hooksDefaults,
  isAccessControlRequired: hooksIsAccessControlRequired,
};
