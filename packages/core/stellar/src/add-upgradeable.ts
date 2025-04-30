import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

export function addUpgradeable(c: ContractBuilder) {
  c.addUseClause('stellar_upgradeable', 'UpgradeableInternal');
  c.addUseClause('stellar_upgradeable_macros', 'Upgradeable');

  const upgradeableTrait = {
    traitName: 'UpgradeableInternal',
    structName: c.name,
    tags: [],
    section: 'Utils',
  };

  c.addTraitFunction(upgradeableTrait, functions._require_auth);

  c.addConstructorArgument({ name: 'owner', type: 'Address' });
  c.addConstructorCode('e.storage().instance().set(&OWNER, &owner);');
}

const functions = defineFunctions({
  _require_auth: {
    args: [getSelfArg(), { name: 'operator', type: '&Address' }],
    code: [
      `operator.require_auth();
       let owner = e.storage().instance().get::<_, Address>(&OWNER).unwrap();
       if *operator != owner {
          panic_with_error!(e, ExampleContractError::Unauthorized)
       }`,
    ],
  },
});
