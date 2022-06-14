import { Contract, ContractBuilder } from './contract';
import { CommonOptions, withCommonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { setAccessControlForContract } from './set-access-control';
import { addPausable } from './add-pausable';

export interface GeneralOptions extends CommonOptions {
  name: string;
  pausable?: boolean;
}

export function buildGeneral(opts: GeneralOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const { access, upgradeable, info } = withCommonDefaults(opts);

  if (opts.pausable) {
    addPausable(c, access, []);
  }

  setAccessControlForContract(c, access);
  setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

