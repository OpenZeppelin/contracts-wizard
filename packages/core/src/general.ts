import { Contract, ContractBuilder } from './contract';
import { CommonOptions, withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { setAccessControlForContract } from './set-access-control';
import { addPausable } from './add-pausable';
import { printContract } from './print';

export interface GeneralOptions extends CommonOptions {
  name: string;
  pausable?: boolean;
}

export const defaults: Required<GeneralOptions> = {
  name: 'MyToken',
  pausable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

function withDefaults(opts: GeneralOptions): Required<GeneralOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    pausable: opts.pausable ?? defaults.pausable,
  };
}

export function printGeneral(opts: GeneralOptions = defaults): string {
  return printContract(buildGeneral(opts));
}

export function isAccessControlRequired(opts: Partial<GeneralOptions>): boolean {
  return opts.pausable || opts.upgradeable === 'uups';
}

export function buildGeneral(opts: GeneralOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, upgradeable, info } = allOpts;

  if (allOpts.pausable) {
    addPausable(c, access, []);
  }

  setAccessControlForContract(c, access);
  setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

