import type { HooksOptions } from '../hooks';
import { ALL_HOOKS } from '../hooks';
import { accessOptions } from '@openzeppelin/wizard/src/set-access-control';
import { infoOptions } from '@openzeppelin/wizard/src/set-info';
import { generateAlternatives } from '@openzeppelin/wizard/src/generate/alternatives';

const booleans = [true, false];

const sharesVariants = [
  { options: false, name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC20', name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC6909', name: 'MyShares', symbol: 'MSH' },
] as const;

const blueprint = {
  hook: ALL_HOOKS as readonly HooksOptions['hook'][],
  name: ['MyHook'] as const,
  pausable: booleans,
  currencySettler: booleans,
  safeCast: booleans,
  transientStorage: booleans,
  access: accessOptions,
  // Hooks are not upgradeable yet; fix to false
  upgradeable: [false] as const,
  info: infoOptions,
  shares: sharesVariants,
};

export function* generateHooksOptions(): Generator<Required<HooksOptions>> {
  yield* generateAlternatives(blueprint);
}
