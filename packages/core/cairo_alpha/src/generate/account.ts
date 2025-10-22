import { accountTypes, type AccountOptions } from '../account';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';
import type { MacrosSubset } from '../set-macros';
import { resolveMacrosOptions } from '../set-macros';

const booleans = [true, false];

type GeneratorOptions = {
  macros: MacrosSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyAccount'],
    type: accountTypes,
    declare: booleans,
    deploy: booleans,
    pubkey: booleans,
    outsideExecution: booleans,
    upgradeable: upgradeableOptions,
    info: infoOptions,
    macros: resolveMacrosOptions(opts.macros),
  };
}

export function* generateAccountOptions(opts: GeneratorOptions): Generator<Required<AccountOptions>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
