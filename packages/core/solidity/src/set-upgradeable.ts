import type { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export const upgradeableOptions = [false, 'transparent', 'uups'] as const;

export type Upgradeable = (typeof upgradeableOptions)[number];


function setupUpgradeableCommon(c: ContractBuilder, upgradeable: Upgradeable) {
  if (upgradeable === false) {
    return false;
  }

  c.upgradeable = true;

  c.addParent({
    name: 'Initializable',
    path: '@openzeppelin/contracts/proxy/utils/Initializable.sol',
  });

  return true;
}


function setupUUPS(c: ContractBuilder, applyAccessControl: () => void) {
  const UUPSUpgradeable = {
    name: 'UUPSUpgradeable',
    path: '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol',
  };
  c.addParent(UUPSUpgradeable);
  c.addOverride(UUPSUpgradeable, functions._authorizeUpgrade);
  
  
  applyAccessControl();
  
  c.setFunctionBody([], functions._authorizeUpgrade);
}

export function setUpgradeable(c: ContractBuilder, upgradeable: Upgradeable, access: Access) {
  if (!setupUpgradeableCommon(c, upgradeable)) {
    return;
  }

  switch (upgradeable) {
    case 'transparent':
      break;

    case 'uups': {
      setupUUPS(c, () => {
        requireAccessControl(c, functions._authorizeUpgrade, access, 'UPGRADER', 'upgrader');
      });
      break;
    }

    default: {
      const _: never = upgradeable as Exclude<Upgradeable, boolean | 'transparent' | 'uups'>;
      throw new Error('Unknown value for `upgradeable`');
    }
  }
}

export function setUpgradeableGovernor(c: ContractBuilder, upgradeable: Upgradeable) {
  if (!setupUpgradeableCommon(c, upgradeable)) {
    return;
  }

  switch (upgradeable) {
    case 'transparent':
      break;

    case 'uups': {
      setupUUPS(c, () => {
        c.addModifier('onlyGovernance', functions._authorizeUpgrade);
      });
      break;
    }

    default: {
      const _: never = upgradeable as Exclude<Upgradeable, boolean | 'transparent' | 'uups'>;
      throw new Error('Unknown value for `upgradeable`');
    }
  }
}

const functions = defineFunctions({
  _authorizeUpgrade: {
    args: [{ name: 'newImplementation', type: 'address' }],
    kind: 'internal',
  },
});
