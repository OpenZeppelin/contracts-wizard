import type { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export const upgradeableOptions = [false, 'transparent', 'uups'] as const;

export type Upgradeable = (typeof upgradeableOptions)[number];

function setUpgradeableBase(
  c: ContractBuilder,
  upgradeable: Upgradeable,
  restrictAuthorizeUpgradeWhenUUPS: () => void,
) {
  if (upgradeable === false) {
    return;
  }

  c.upgradeable = true;

  c.addParent({
    name: 'Initializable',
    path: '@openzeppelin/contracts/proxy/utils/Initializable.sol',
    transpiled: false,
  });

  switch (upgradeable) {
    case 'transparent':
      break;

    case 'uups': {
      restrictAuthorizeUpgradeWhenUUPS();
      const UUPSUpgradeable = {
        name: 'UUPSUpgradeable',
        path: '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol',
        transpiled: false,
      };
      c.addParent(UUPSUpgradeable);
      c.addOverride(UUPSUpgradeable, functions._authorizeUpgrade);
      c.setFunctionBody([], functions._authorizeUpgrade);
      break;
    }

    default: {
      const _: never = upgradeable;
      throw new Error('Unknown value for `upgradeable`');
    }
  }
}

export function setUpgradeable(c: ContractBuilder, upgradeable: Upgradeable, access: Access) {
  setUpgradeableBase(c, upgradeable, () => {
    requireAccessControl(c, functions._authorizeUpgrade, access, 'UPGRADER', 'upgrader');
  });
}

export function setUpgradeableGovernor(c: ContractBuilder, upgradeable: Upgradeable) {
  setUpgradeableBase(c, upgradeable, () => {
    c.addModifier('onlyGovernance', functions._authorizeUpgrade);
  });
}

export function setUpgradeableAccount(c: ContractBuilder, upgradeable: Upgradeable) {
  setUpgradeableBase(c, upgradeable, () => {
    c.addModifier('onlyEntryPointOrSelf', functions._authorizeUpgrade);
  });
}

const functions = defineFunctions({
  _authorizeUpgrade: {
    args: [{ name: 'newImplementation', type: 'address' }],
    kind: 'internal',
  },
});
