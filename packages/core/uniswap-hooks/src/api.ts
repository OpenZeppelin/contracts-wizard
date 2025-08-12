import type { WizardContractAPI, AccessControlAPI } from '@openzeppelin/wizard/src/api';

import {
  printHooks,
  defaults as hooksDefaults,
  isAccessControlRequired as hooksIsAccessControlRequired,
} from './hooks';
import type { HooksOptions } from './hooks';

export type Hooks = WizardContractAPI<HooksOptions> & AccessControlAPI<HooksOptions>;

export const hooks: Hooks = {
  print: printHooks,
  defaults: hooksDefaults,
  isAccessControlRequired: hooksIsAccessControlRequired,
};
