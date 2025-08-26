import type { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export const upgradeableOptions = [false, 'transparent', 'uups'] as const;

export type Upgradeable = (typeof upgradeableOptions)[number];

export function setUpgradeable(c: ContractBuilder, upgradeable: Upgradeable, access: Access) {
  if (upgradeable === false) {
    return;
  }

  c.upgradeable = true;

  c.addParent({
    name: 'Initializable',
    path: '@openzeppelin/contracts/proxy/utils/Initializable.sol',
  });

  switch (upgradeable) {
    case 'transparent':
      break;

    case 'uups': {
      requireAccessControl(c, functions._authorizeUpgrade, access, 'UPGRADER', 'upgrader');
      const UUPSUpgradeable = {
        name: 'UUPSUpgradeable',
        path: '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol',
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

const functions = defineFunctions({
  _authorizeUpgrade: {
    kind: 'internal',
    args: [{ name: 'newImplementation', type: 'address' }],
    comments: [
      '/// @dev Authorizes the upgrade to a new implementation. This function must be overridden to implement access control for upgrades. Failure to override this function will allow anyone to upgrade the contract, posing a serious security risk.',
    ],
  },
});
