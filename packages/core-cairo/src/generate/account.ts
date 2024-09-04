import { accountOptions, type AccountOptions } from '../account';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const blueprint = {
  name: ['MyAccount'],
  type: accountOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateAccountOptions(): Generator<Required<AccountOptions>> {
  yield* generateAlternatives(blueprint);
}
