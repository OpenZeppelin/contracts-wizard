import type { BaseFunction, Contract } from './contract';
import { ContractBuilder } from './contract';
import type { CommonOptions } from './common-options';
import { withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { printContract } from './print';
import { defineFunctions } from './utils/define-functions';

export interface CustomOptions extends CommonOptions {
  name: string;
  superchainInteropFunction?: string;
  pausable?: boolean;
}

export const defaults: Required<CustomOptions> = {
  name: 'MyContract',
  superchainInteropFunction: '',
  pausable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

function withDefaults(opts: CustomOptions): Required<CustomOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    superchainInteropFunction: opts.superchainInteropFunction ?? defaults.superchainInteropFunction,
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

  if (allOpts.superchainInteropFunction) {
    addSuperchainInterop(c, allOpts.superchainInteropFunction, allOpts.access, allOpts.pausable);
  }

  if (allOpts.pausable) {
    addPausable(c, access, []);
  }

  setAccessControl(c, access);
  setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

function addSuperchainInterop(c: ContractBuilder, superchainInteropFunction: string, access: Access, pausable: boolean) {
  // Add source function
  const sourceFn: BaseFunction = {
    name: `call${superchainInteropFunction.replace(/^(.)/i, c => c.toUpperCase())}`,
    kind: 'public' as const,
    args: [],
  };

  requireAccessControl(c, sourceFn, access, 'CROSS_CHAIN_CALLER', 'crossChainCaller');
  c.addFunctionCode(
    `messenger.sendMessage(_toChainId, address(this), abi.encodeCall(this.${superchainInteropFunction}, (/* TODO: Add arguments */)));`,
    sourceFn,
  );

  // Add destination function
  const destFn: BaseFunction = {
    name: superchainInteropFunction,
    kind: 'external' as const,
    args: [],
  };

  if (pausable) {
    c.addModifier('whenNotPaused', destFn);
  }

  c.addFunctionCode('// TODO: Implement logic for the function that will be called from another chain', destFn);
}

