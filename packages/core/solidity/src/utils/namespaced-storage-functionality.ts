import { BaseFunction, ContractBuilder, ContractStruct } from '../contract';
import { computeNamespacedStorageSlot, getNamespaceId } from './namespaced-storage-generator';

export function addNamespacedFunctionImplementation(
  c: ContractBuilder,
  fn: BaseFunction,
  namespace: string = 'myProject',
) {
  const storageFn = getStorageFunction(c.name);
  const storageStruct = getStorageStruct(c.name, namespace);
  const namespacedStorageName = `${c.name.toUpperCase()}_STORAGE_LOCATION`;
  const namespaceId = getNamespaceId(c.name, namespace);
  c.addStructVariable(storageStruct, 'uint256 _nextTokenId;');
  c.addVariable(`// keccak256(abi.encode(uint256(keccak256("${namespaceId}")) - 1)) & ~bytes32(uint256(0xff));`);
  c.addVariable(`bytes32 private constant ${namespacedStorageName} = ${computeNamespacedStorageSlot(namespaceId)};`);
  c.addFunctionCode(`assembly { $.slot :=  ${namespacedStorageName} }`, storageFn);

  c.addFunctionCode(`${c.name}Storage storage $ = ${storageFn.name}();`, fn);
}

function getStorageFunction(name: string): BaseFunction {
  const fn: BaseFunction = {
    name: `_get${name}Storage`,
    kind: 'private' as const,
    mutability: 'pure',
    args: [],
    returns: [`${name}Storage storage $`],
  };

  return fn;
}

function getStorageStruct(name: string, namespace: string) {
  const struct: ContractStruct = {
    name: `${name}Storage`,
    comments: [`/// @custom:storage-location erc7201:${getNamespaceId(name, namespace)}`],
    variables: [],
  };
  return struct;
}
