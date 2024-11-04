import { Contract, ContractBuilder } from './contract';
import { CommonOptions, withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { printContract } from './print';

export interface StablecoinOptions extends CommonOptions {
  name: string;
  pausable?: boolean;
}

export const defaults: Required<StablecoinOptions> = {
  name: 'MyContract',
  pausable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

function withDefaults(opts: StablecoinOptions): Required<StablecoinOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    pausable: opts.pausable ?? defaults.pausable,
  };
}

export function printStablecoin(opts: StablecoinOptions = defaults): string {
  return printContract(buildStablecoin(opts));
}

export function isAccessControlRequired(opts: Partial<StablecoinOptions>): boolean {
  return opts.pausable || opts.upgradeable === 'uups';
}

export function buildStablecoin(opts: StablecoinOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, upgradeable, info } = allOpts;

  if (allOpts.pausable) {
    addPausable(c, access, []);
  }

  setAccessControl(c, access);
  setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

