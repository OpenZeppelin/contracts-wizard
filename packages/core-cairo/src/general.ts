import { Contract, ContractBuilder } from './contract';
import { addPausable } from './add-pausable';
import { CommonOptions, withCommonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { defaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControlForContract } from './set-access-control';

export const defaults: Required<GeneralOptions> = {
  pausable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

export function printGeneral(opts: GeneralOptions = defaults): string {
  return printContract(buildGeneral(opts));
}

export interface GeneralOptions extends CommonOptions {
  pausable?: boolean;
}

function withDefaults(opts: GeneralOptions): Required<GeneralOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    pausable: opts.pausable ?? defaults.pausable,
  };
}

export function isAccessControlRequired(opts: Partial<GeneralOptions>): boolean {
  return opts.pausable === true;
}

export function buildGeneral(opts: GeneralOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder();

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, []);
  }

  setAccessControlForContract(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable);
  setInfo(c, allOpts.info);

  return c;
}
