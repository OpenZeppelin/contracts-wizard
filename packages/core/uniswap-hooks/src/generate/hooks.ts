import { infoOptions, accessOptions, generateAlternatives } from '@openzeppelin/wizard';
import type { HooksOptions } from '../hooks';
import { PERMISSIONS, HooksNames } from '../hooks/index';
import type { Shares, Permissions } from '../hooks/index';

const sharesOptions: readonly Shares[] = [
  { options: false, name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC20', name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC6909', name: 'MyShares', symbol: 'MSH' },
];

// Warning: Too many options will result in a exponential amount of combinations
// - Keep utility libraries marked as true to keep combinations manageable
// - Use a small set of permissions mixed to keep combinations manageable
const blueprint = {
  hook: HooksNames,
  name: ['MyHook'] as const,
  pausable: [true, false],
  access: accessOptions,
  info: infoOptions,
  shares: sharesOptions,
  permissions: [generateMixedPermissions(), generateMixedInversedPermissions()],
  currencySettler: [true],
  safeCast: [true],
  transientStorage: [true],
  inputs: [{ blockNumberOffset: 10, maxAbsTickDelta: 887272 }],
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
