import type { WizardContractAPI, AccessControlAPI } from '@openzeppelin/wizard';
import {
  printHooks,
  defaults as hooksDefaults,
  isAccessControlRequired as hooksIsAccessControlRequired,
  type HooksOptions,
} from './hooks';
import { getVersionedRemappings } from './get-versioned-remappings';

export type Hooks = WizardContractAPI<HooksOptions> & AccessControlAPI<HooksOptions>;

export const hooks: Hooks = {
  print: printHooks,
  getVersionedRemappings: getVersionedRemappings,
  defaults: hooksDefaults,
  isAccessControlRequired: hooksIsAccessControlRequired,
};
