import { getSelfArg } from './common-options';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import type { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

export function addUpgradeable(c: ContractBuilder, access: Access) {
  const functions = defineFunctions({
    _require_auth: {
      args: [getSelfArg(), { name: 'operator', type: '&Address' }],
      code: [],
    },
  });

  c.addUseClause('stellar_upgradeable', 'UpgradeableInternal');
  c.addUseClause('stellar_upgradeable_macros', 'Upgradeable');

  c.addDerives('Upgradeable');

  const upgradeableTrait = {
    traitName: 'UpgradeableInternal',
    structName: c.name,
    tags: [],
    section: 'Utils',
  };

  c.addTraitFunction(upgradeableTrait, functions._require_auth);

  requireAccessControl(c, upgradeableTrait, functions._require_auth, access, {
    useMacro: false,
    role: 'upgrader',
    caller: 'operator',
  });
}
