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

export function importGetCallerAddress(c: ContractBuilder) {
  c.addModule(
    modules.syscalls, [], [], false
  );
  c.addModuleFunction(modules.syscalls, 'get_caller_address');
}

const modules = defineModules({
  ERC165: {
    path: 'openzeppelin.introspection.erc165.library',
    useNamespace: true
  },

  syscalls: {
    path: 'starkware.starknet.common.syscalls',
    useNamespace: false
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