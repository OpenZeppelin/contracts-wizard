import type { BaseFunction, ContractBuilder, ContractStruct } from './contract';
import { computeNamespacedStorageSlot } from './utils/namespaced-slot';
import { OptionsError } from './error';

/**
 * Sets namespaced variables in storage struct, and adds a function to retrieve namespaced storage.
 */
export function setNamespacedStorage(c: ContractBuilder, structVariables: string[], namespacePrefix: string) {
  validateNoWhitespace(namespacePrefix);

  const namespaceId = toNamespaceId(namespacePrefix, c.name);
  const storageFn = makeStorageFunction(c.name);
  const storageStruct = makeStorageStruct(c.name, namespaceId);
  const namespacedStorageConstant = `${c.name.toUpperCase()}_STORAGE_LOCATION`;

  structVariables.forEach(v => c.addStructVariable(storageStruct, v));

  c.addConstantOrImmutableOrErrorDefinition(
    `bytes32 private constant ${namespacedStorageConstant} = ${computeNamespacedStorageSlot(namespaceId)};`,
    [`// keccak256(abi.encode(uint256(keccak256("${namespaceId}")) - 1)) & ~bytes32(uint256(0xff))`],
  );
  c.addFunctionCode(`assembly { $.slot := ${namespacedStorageConstant} }`, storageFn);
}

export function toStorageStructInstantiation(name: string) {
  return `${name}Storage storage $ = ${makeStorageFunction(name).name}();`;
}

/**
 * According to ERC-7201, namespace ids should not contain any whitespace characters.
 */
function validateNoWhitespace(namespacePrefix: string) {
  if (namespacePrefix.match(/\s+/)) {
    throw new OptionsError({ namespacePrefix: 'Namespace prefix should not contain whitespace characters' });
  }
}

/**
 * Creates a namespace ID from a namespace prefix and a contract name.
 * If the namespace prefix is empty, returns the contract name.
 */
function toNamespaceId(namespacePrefix: string, name: string) {
  if (namespacePrefix.length === 0) {
    return name;
  } else {
    return `${namespacePrefix}.${name}`;
  }
}

function makeStorageFunction(name: string): BaseFunction {
  const fn: BaseFunction = {
    name: `_get${name}Storage`,
    kind: 'private' as const,
    mutability: 'pure',
    args: [],
    returns: [`${name}Storage storage $`],
  };

  return fn;
}

function makeStorageStruct(name: string, namespaceId: string) {
  const struct: ContractStruct = {
    name: `${name}Storage`,
    comments: [`/// @custom:storage-location erc7201:${namespaceId}`],
    variables: [],
  };
  return struct;
}
