import type { HooksOptions } from '../hooks';
import { accessOptions } from '@openzeppelin/wizard/src/set-access-control';
import { infoOptions } from '@openzeppelin/wizard/src/set-info';
import { upgradeableOptions } from '@openzeppelin/wizard/src/set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyHook'],
  pausable: booleans,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateHooksOptions(): Generator<Required<HooksOptions>> {
  yield* generateAlternatives(blueprint);
}
