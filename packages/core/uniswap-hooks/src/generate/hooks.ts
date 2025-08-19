import type { HooksOptions } from '../hooks';
import { Hooks, type HookName } from '../hooks/index';
import { accessOptions } from '@openzeppelin/wizard/src/set-access-control';
import { infoOptions } from '@openzeppelin/wizard/src/set-info';
import { generateAlternatives } from '@openzeppelin/wizard/src/generate/alternatives';

const booleanOptions = [true, false];

const sharesOptions = [
  { options: false, name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC20', name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC6909', name: 'MyShares', symbol: 'MSH' },
] as const;

// Enable one by one until fixing all overrides
// const hooksOptions: HookName[] = Hooks.map(hook => hook.name);
const hooksOptions: HookName[] = ['BaseHook'];

const blueprint = {
  hook: hooksOptions as readonly HookName[],
  name: ['MyHook'] as const,
  pausable: booleanOptions,
  currencySettler: booleanOptions,
  safeCast: booleanOptions,
  transientStorage: booleanOptions,
  access: accessOptions,
  // Hooks are not upgradeable yet; fix to false
  upgradeable: [false] as const,
  info: infoOptions,
  shares: sharesOptions,
};

export function* generateHooksOptions(): Generator<Required<HooksOptions>> {
  yield* generateAlternatives(blueprint);
}
