import { getSelfArg } from './common-options';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import type { BaseFunction, ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

export function addUpgradeable(c: ContractBuilder, access: Access) {
  const functions = defineFunctions({
    _require_auth: {
      args: [getSelfArg(), { name: 'operator', type: '&Address' }],
      code: ['operator.require_auth();'],
    },
    _require_auth_unused_operator: {
      name: '_require_auth',
      args: [getSelfArg(), { name: '_operator', type: '&Address' }],
      code: [],
    },
  });

  c.addUseClause('stellar_contract_utils::upgradeable', 'UpgradeableInternal');
  c.addUseClause('stellar_macros', 'Upgradeable');

  c.addDerives('Upgradeable');

  const upgradeableTrait = {
    traitName: 'UpgradeableInternal',
    structName: c.name,
    tags: [],
    section: 'Utils',
  };

  const upgradeFn: BaseFunction =
    access === 'ownable' ? functions._require_auth_unused_operator : functions._require_auth;

  c.addTraitFunction(upgradeableTrait, upgradeFn);

  requireAccessControl(c, upgradeableTrait, upgradeFn, access, {
    useMacro: false,
    role: 'upgrader',
    caller: 'operator',
  });
}
