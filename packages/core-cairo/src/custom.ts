import { Contract, ContractBuilder } from './contract';
import { addPausable } from './add-pausable';
import { CommonOptions, withCommonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { defaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';

export const defaults: Required<CustomOptions> = {
  pausable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

export function printCustom(opts: CustomOptions = defaults): string {
  return printContract(buildCustom(opts));
}

export interface CustomOptions extends CommonOptions {
  pausable?: boolean;
}

function withDefaults(opts: CustomOptions): Required<CustomOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    pausable: opts.pausable ?? defaults.pausable,
  };
}

export function isAccessControlRequired(opts: Partial<CustomOptions>): boolean {
  return opts.pausable === true;
}

export function buildCustom(opts: CustomOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder();

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, []);
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable);
  setInfo(c, allOpts.info);

  return c;
}
