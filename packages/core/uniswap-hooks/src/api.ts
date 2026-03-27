import type { WizardContractAPI, AccessControlAPI } from '@openzeppelin/wizard';
import {
  printHooks,
  defaults as hooksDefaults,
  isAccessControlRequired as hooksIsAccessControlRequired,
  type HooksOptions,
} from './hooks';

export type Hooks = Omit<WizardContractAPI<HooksOptions>, 'getVersionedRemappings'> & AccessControlAPI<HooksOptions>;

export const hooks: Hooks = {
  print: printHooks,
  defaults: hooksDefaults,
  isAccessControlRequired: hooksIsAccessControlRequired,
};
