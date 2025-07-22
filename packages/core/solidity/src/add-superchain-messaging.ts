import type { ContractBuilder } from './contract';
import { type BaseFunction } from './contract';
import { OptionsError } from './error';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { toIdentifier } from './utils/to-identifier';

export function addSuperchainMessaging(c: ContractBuilder, functionName: string, access: Access, pausable: boolean) {
  const sanitizedFunctionName = safeSanitizeFunctionName(functionName);

  addCustomErrors(c);
  addCrossDomainMessengerImmutable(c);
  addOnlyCrossDomainCallbackModifier(c);
  addSourceFunction(sanitizedFunctionName, access, c, pausable);
  addDestinationFunction(sanitizedFunctionName, c, pausable);
}

function safeSanitizeFunctionName(functionName: string) {
  const sanitizedFunctionName = toIdentifier(functionName, false);
  if (sanitizedFunctionName.length === 0) {
    throw new OptionsError({
      crossChainFunctionName: 'Not a valid function name',
    });
  }
  return sanitizedFunctionName;
}

function addCustomErrors(c: ContractBuilder) {
  c.addCustomError('CallerNotL2ToL2CrossDomainMessenger');
  c.addCustomError('InvalidCrossDomainSender');
  c.addCustomError('InvalidDestination');
}

function addCrossDomainMessengerImmutable(c: ContractBuilder) {
  c.addImportOnly({
    name: 'IL2ToL2CrossDomainMessenger',
    path: '@eth-optimism/contracts-bedrock/src/L2/IL2ToL2CrossDomainMessenger.sol',
    transpiled: false,
  });
  c.addImportOnly({
    name: 'Predeploys',
    path: '@eth-optimism/contracts-bedrock/src/libraries/Predeploys.sol',
    transpiled: false,
  });
  c.addVariable(
    'IL2ToL2CrossDomainMessenger public immutable messenger = IL2ToL2CrossDomainMessenger(Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER);',
  );
}

function addOnlyCrossDomainCallbackModifier(c: ContractBuilder) {
  c.addModifierDefinition({
    name: 'onlyCrossDomainCallback',
    code: [
      'if (msg.sender != address(messenger)) revert CallerNotL2ToL2CrossDomainMessenger();',
      'if (messenger.crossDomainMessageSender() != address(this)) revert InvalidCrossDomainSender();',
      '_;',
    ],
  });
}

function addSourceFunction(sanitizedFunctionName: string, access: Access, c: ContractBuilder, pausable: boolean) {
  const sourceFn: BaseFunction = {
    name: `call${sanitizedFunctionName.replace(/^(.)/, c => c.toUpperCase())}`,
    kind: 'public' as const,
    args: [],
  };

  if (access) {
    requireAccessControl(c, sourceFn, access, 'CROSSCHAIN_CALLER', 'crossChainCaller');
  } else {
    c.setFunctionComments(['// NOTE: Anyone can call this function'], sourceFn);
  }

  if (pausable) {
    c.addModifier('whenNotPaused', sourceFn);
  }

  c.setFunctionBody(
    [
      'if (_toChainId == block.chainid) revert InvalidDestination();',
      `messenger.sendMessage(_toChainId, address(this), abi.encodeCall(this.${sanitizedFunctionName}, (/* TODO: Add arguments */)));`,
    ],
    sourceFn,
  );
}

function addDestinationFunction(sanitizedFunctionName: string, c: ContractBuilder, pausable: boolean) {
  const destFn: BaseFunction = {
    name: sanitizedFunctionName,
    kind: 'external' as const,
    args: [],
    argInlineComment: 'TODO: Add arguments',
  };
  c.setFunctionComments(
    [
      '/**',
      ' * @dev IMPORTANT: You must either design the deployer to allow only a specific trusted contract,',
      ' * such as this contract, to be deployed through it, or use CREATE2 from a deployer contract',
      ' * that is itself deployed by an EOA you control.',
      ' * This precaution is critical because if an unauthorized contract is deployed at the same',
      ' * address on any Superchain network, it could allow malicious actors to invoke your function',
      ' * from another chain.',
      ' */',
    ],
    destFn,
  );

  c.addModifier('onlyCrossDomainCallback', destFn);
  if (pausable) {
    c.addModifier('whenNotPaused', destFn);
  }

  c.addFunctionCode('// TODO: Implement logic for the function that will be called from another chain', destFn);
}
