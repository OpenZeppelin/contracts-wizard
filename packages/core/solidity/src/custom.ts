import type { BaseFunction, Contract } from './contract';
import { ContractBuilder } from './contract';
import type { CommonOptions } from './common-options';
import { withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { printContract } from './print';
import { toIdentifier } from './utils/to-identifier';
import { OptionsError } from './error';

export const CrossChainMessagingOptions = [false, 'superchain'] as const;
export type CrossChainMessaging = (typeof CrossChainMessagingOptions)[number];

export interface CustomOptions extends CommonOptions {
  name: string;
  crossChainMessaging?: CrossChainMessaging;
  crossChainFunctionName?: string;
  pausable?: boolean;
}

export const defaults: Required<CustomOptions> = {
  name: 'MyContract',
  crossChainMessaging: false,
  crossChainFunctionName: 'myFunction',
  pausable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

function withDefaults(opts: CustomOptions): Required<CustomOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    crossChainMessaging: opts.crossChainMessaging ?? defaults.crossChainMessaging,
    crossChainFunctionName: opts.crossChainFunctionName ?? defaults.crossChainFunctionName,
    pausable: opts.pausable ?? defaults.pausable,
  };
}

export function printCustom(opts: CustomOptions = defaults): string {
  return printContract(buildCustom(opts));
}

export function isAccessControlRequired(opts: Partial<CustomOptions>): boolean {
  return opts.pausable || opts.upgradeable === 'uups';
}

export function buildCustom(opts: CustomOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, upgradeable, info } = allOpts;

  if (allOpts.crossChainMessaging === 'superchain') {
    addSuperchainInteropMessagePassing(c, allOpts.crossChainFunctionName, allOpts.access, allOpts.pausable);
  }

  if (allOpts.pausable) {
    addPausable(c, access, []);
  }

  setAccessControl(c, access);
  setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

function addSuperchainInteropMessagePassing(c: ContractBuilder, functionName: string, access: Access, pausable: boolean) {
  const sanitizedFunctionName = toIdentifier(functionName, false);
  if (sanitizedFunctionName.length === 0) {
    throw new OptionsError({
      crossChainFunctionName: 'Not a valid function name',
    });
  }

  // Add custom errors
  c.addCustomError('CallerNotL2ToL2CrossDomainMessenger');
  c.addCustomError('InvalidCrossDomainSender');
  c.addCustomError('InvalidDestination');

  // Add cross domain messenger
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
  c.addVariable('IL2ToL2CrossDomainMessenger public immutable messenger = IL2ToL2CrossDomainMessenger(Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER);');

  // Add modifier definition
  c.addModifierDefinition({
    name: 'onlyCrossDomainCallback',
    code: [
      'if (msg.sender != address(messenger)) revert CallerNotL2ToL2CrossDomainMessenger();',
      'if (messenger.crossDomainMessageSender() != address(this)) revert InvalidCrossDomainSender();',
      '_;',
    ],
  });

  // Add source function
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

  c.setFunctionBody(
    [
      'if (_toChainId == block.chainid) revert InvalidDestination();',
      `messenger.sendMessage(_toChainId, address(this), abi.encodeCall(this.${sanitizedFunctionName}, (/* TODO: Add arguments */)));`,
    ],
    sourceFn,
  );

  // Add destination function
  const destFn: BaseFunction = {
    name: sanitizedFunctionName,
    kind: 'external' as const,
    args: [],
    argInlineComment: 'TODO: Add arguments',
  };
  c.setFunctionComments([
    '/**',
    ' * @dev IMPORTANT: You must either design the deployer to allow only a specific trusted contract,',
    ' * such as this contract, to be deployed through it, or use CREATE2 from a deployer contract',
    ' * that is itself deployed by an EOA you control.',
    ' * This precaution is critical because if an unauthorized contract is deployed at the same',
    ' * address on any Superchain network, it could allow malicious actors to invoke your function',
    ' * from another chain.',
    ' */',
  ], destFn);

  c.addModifier('onlyCrossDomainCallback', destFn);
  if (pausable) {
    c.addModifier('whenNotPaused', destFn);
  }

  c.addFunctionCode('// TODO: Implement logic for the function that will be called from another chain', destFn);
}

