import { Contract, ContractBuilder } from './contract';
import { CommonOptions, withCommonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { setAccessControlForContract } from './set-access-control';

export interface GeneralOptions extends CommonOptions {
  name: string;
  functionName: string;
}

export function buildGeneral(opts: GeneralOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const { access, upgradeable, info } = withCommonDefaults(opts);

  setAccessControlForContract(c, access);
  setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

