import type { ContractBuilder } from './contract';
//import { Access, setAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export const upgradeableOptions = [false, 'transparent', 'uups'] as const;

export type Upgradeable = typeof upgradeableOptions[number];

export function setUpgradeable(c: ContractBuilder, upgradeable: Upgradeable) { //}, access: Access) {
  if (upgradeable === false) {
    return;
  }

  c.upgradeable = true;

  c.addParentLibrary(
    {
      prefix: 'Proxy',
      modulePath: 'openzeppelin/upgrades/library',
    },
    [ {lit: 'proxy_admin' }],
    ['Proxy_initializer', 'Proxy_only_admin', 'Proxy_set_implementation']
  );
  c.addConstructorArgument({ name:'proxy_admin', type:'felt' });

  // switch (upgradeable) {
  //   case 'transparent': break;

  //   case 'uups': {
  //     setAccessControl(c, functions._authorizeUpgrade, access, 'UPGRADER');
  //     // c.addParent({
  //     //   name: 'UUPSUpgradeable',
  //     //   path: 'openzeppelin/contracts/proxy/utils/UUPSUpgradeable',
  //     // });
  //     // c.addOverride('UUPSUpgradeable', functions._authorizeUpgrade);
  //     c.setFunctionBody([], functions._authorizeUpgrade);
  //     break;
  //   }

  //   default: {
  //     const _: never = upgradeable;
  //     throw new Error('Unknown value for `upgradeable`');
  //   }
  // }
}

const functions = defineFunctions({
  _authorizeUpgrade: {
    args: [
      { name: 'newImplementation', type: 'address' },
    ],
    // kind: 'internal',
  },
});
