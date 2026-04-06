import { getSelfArg } from './common-options';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import type { BaseFunction, ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

export function addUpgradeable(c: ContractBuilder, access: Access, explicitImplementations: boolean) {
  const functions = defineFunctions({
    upgrade: {
      args: [getSelfArg(), { name: 'new_wasm_hash', type: 'BytesN<32>' }, { name: 'operator', type: 'Address' }],
      code: ['upgradeable::upgrade(e, &new_wasm_hash)'],
    },
  });

  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'BytesN');
  c.addUseClause('stellar_contract_utils::upgradeable', 'self', { alias: 'upgradeable' });
  c.addUseClause('stellar_contract_utils::upgradeable', 'Upgradeable');

  const upgradeableTrait = {
    traitName: 'Upgradeable',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Utils',
  };

  const upgradeFn: BaseFunction = functions.upgrade;

  c.addTraitFunction(upgradeableTrait, upgradeFn);

  requireAccessControl(
    c,
    upgradeableTrait,
    upgradeFn,
    access,
    {
      useMacro: false,
      role: 'upgrader',
      caller: 'operator',
    },
    explicitImplementations,
  );
}
