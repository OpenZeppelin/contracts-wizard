import { withImplicitArgs } from './common-options';
import type { ContractBuilder } from './contract';
//import { Access, setAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';

export const upgradeableOptions = [false, true] as const;

export type Upgradeable = typeof upgradeableOptions[number];

export function setUpgradeable(c: ContractBuilder, upgradeable: Upgradeable) {
  if (upgradeable === false) {
    return;
  }

  c.upgradeable = true;

  c.addModule(modules.Proxy, [ {lit: 'proxy_admin' }]);
  c.addModuleFunction(modules.Proxy, 'Proxy_only_admin');
  c.addModuleFunction(modules.Proxy, 'Proxy_set_implementation');

  c.addConstructorArgument({ name:'proxy_admin', type:'felt' });

  c.setFunctionBody([
    'Proxy_only_admin()',
    'Proxy_set_implementation(new_implementation)'
  ], functions.upgrade);
}

const modules = defineModules( {
  Proxy: {
    path: 'openzeppelin/upgrades/library',
    usePrefix: true
  },
});

const functions = defineFunctions({

  upgrade: {
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'new_implementation', type: 'felt' },
    ],
    returns: [],
  },

});
