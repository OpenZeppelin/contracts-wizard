import { getSelfArg } from './common-options';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import type { BaseFunction, ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

/**
 * Makes the contract upgradeable, authorized by the contract itself rather than
 * by an access control role.
 *
 * Used by smart accounts, where authorization always flows through
 * `__check_auth` and the account's context rules: an `Ownable`/`AccessControl`
 * gate would add a second, weaker authorization path.
 */
export function addSelfAuthUpgradeable(c: ContractBuilder) {
  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'BytesN');
  c.addUseClause('stellar_contract_utils::upgradeable', 'self', { alias: 'upgradeable' });
  c.addUseClause('stellar_contract_utils::upgradeable', 'Upgradeable');

  c.addTraitFunction(
    {
      traitName: 'Upgradeable',
      structName: c.name,
      tags: ['contractimpl'],
      section: 'Utils',
    },
    {
      name: 'upgrade',
      args: [getSelfArg(), { name: 'new_wasm_hash', type: 'BytesN<32>' }, { name: '_operator', type: 'Address' }],
      code: ['e.current_contract_address().require_auth()', 'upgradeable::upgrade(e, &new_wasm_hash)'],
    },
  );
}

export function addUpgradeable(c: ContractBuilder, access: Access, explicitImplementations: boolean) {
  const functions = defineFunctions({
    upgrade: {
      args: [getSelfArg(), { name: 'new_wasm_hash', type: 'BytesN<32>' }, { name: 'operator', type: 'Address' }],
      code: ['upgradeable::upgrade(e, &new_wasm_hash)'],
    },
    upgrade_unused_operator: {
      name: 'upgrade',
      args: [getSelfArg(), { name: 'new_wasm_hash', type: 'BytesN<32>' }, { name: '_operator', type: 'Address' }],
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

  const upgradeFn: BaseFunction = access === 'ownable' ? functions.upgrade_unused_operator : functions.upgrade;

  c.addTraitFunction(upgradeableTrait, upgradeFn);

  requireAccessControl(
    c,
    upgradeableTrait,
    upgradeFn,
    access,
    {
      useMacro: true,
      role: 'upgrader',
      caller: 'operator',
    },
    explicitImplementations,
  );
}
