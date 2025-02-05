import { accountTypes, type AccountOptions } from '../account';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyAccount'],
  type: accountTypes,
  declare: booleans,
  deploy: booleans,
  pubkey: booleans,
  outsideExecution: booleans,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateAccountOptions(): Generator<Required<AccountOptions>> {
  yield* generateAlternatives(blueprint);
}
