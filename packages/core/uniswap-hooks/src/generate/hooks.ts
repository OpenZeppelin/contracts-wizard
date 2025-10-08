import { infoOptions, accessOptions, generateAlternatives } from '@openzeppelin/wizard';
import type { HooksOptions } from '../hooks';
import { HOOKS, PERMISSIONS, type HookName, type Shares, type Permissions } from '../hooks/index';

const booleanOptions = [true, false];

const sharesOptions: Shares[] = [
  { options: false, name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC20', name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC6909', name: 'MyShares', symbol: 'MSH' },
] as const;

// Generate some permission combinations. Note that generating all would result in 2^14 combinations.
const permissionsOptions: Permissions[] = [generateMixedPermissions(), generateMixedInversedPermissions()] as const;

const hooksOptions: HookName[] = Object.keys(HOOKS) as HookName[];

const inputsOptions = [{ blockNumberOffset: 10 }];

const blueprint = {
  hook: hooksOptions as readonly HookName[],
  name: ['MyHook'] as const,
  pausable: booleanOptions,
  access: accessOptions,
  info: infoOptions,
  shares: sharesOptions,
  permissions: permissionsOptions,
  // Hooks are not upgradeable yet; fix to false
  upgradeable: [false] as const,
  // Keep utility libraries marked as true to keep combinations manageable
  currencySettler: [true],
  safeCast: [true],
  transientStorage: [true],
  inputs: inputsOptions,
};

export function* generateHooksOptions(): Generator<Required<HooksOptions>> {
  yield* generateAlternatives(blueprint);
}

export function generateMixedPermissions(): Permissions {
  return Object.fromEntries(PERMISSIONS.map((key, idx) => [key, idx % 2 === 0])) as Permissions;
}

export function generateMixedInversedPermissions(): Permissions {
  return Object.fromEntries(PERMISSIONS.map((key, idx) => [key, idx % 2 !== 0])) as Permissions;
}

export function generateAllPermissions(): Permissions {
  return Object.fromEntries(PERMISSIONS.map(key => [key, true])) as Permissions;
}
