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
  onlyUseUpgradeableInitializableAndUUPS: boolean = false,
) {
  if (upgradeable === false) {
    return;
  }

  c.shouldAutoTranspileImports = !onlyUseUpgradeableInitializableAndUUPS;
  c.shouldInstallContractsUpgradeable = true;
  c.shouldUseUpgradesPluginsForProxyDeployment = true;

  c.addParent({
    name: 'Initializable',
    path: `@openzeppelin/${onlyUseUpgradeableInitializableAndUUPS ? 'contracts-upgradeable' : 'contracts'}/proxy/utils/Initializable.sol`,
  });

  switch (upgradeable) {
    case 'transparent':
      break;

    case 'uups': {
      restrictAuthorizeUpgradeWhenUUPS();
      const UUPSUpgradeable = {
        name: 'UUPSUpgradeable',
        path: `@openzeppelin/${onlyUseUpgradeableInitializableAndUUPS ? 'contracts-upgradeable' : 'contracts'}/proxy/utils/UUPSUpgradeable.sol`,
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
  if (upgradeable === false) {
    return;
  }
  setUpgradeableBase(
    c,
    upgradeable,
    () => {
      c.addModifier('onlyEntryPointOrSelf', functions._authorizeUpgrade);
    },
    true, // account.ts handles usage of transpiled imports (when needed) rather than using helpers.
  );
  c.shouldInstallContractsUpgradeable = true;
  c.shouldUseUpgradesPluginsForProxyDeployment = false; // this will eventually use a factory to deploy proxies
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
