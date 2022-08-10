import { withImplicitArgs } from './common-options';
import type { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';

export function addSupportsInterface(c: ContractBuilder) {
  c.addModule(
    modules.ERC165, [], [], false
  );
  c.addFunction(functions.supportsInterface);
}

const modules = defineModules( {
  ERC165: {
    path: 'openzeppelin.introspection.erc165.library',
    useNamespace: true
  },
})

const functions = defineFunctions({
  // --- view functions ---
  supportsInterface: {
    module: modules.ERC165,
    kind: 'view',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'interfaceId', type: 'felt' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    passthrough: true,
    parentFunctionName: 'supports_interface',
  },
});