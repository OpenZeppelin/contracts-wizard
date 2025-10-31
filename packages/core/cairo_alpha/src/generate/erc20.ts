import type { ERC20Options } from '../erc20';
import type { AccessSubset } from '../set-access-control';
import { resolveAccessControlOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

type GeneratorOptions = {
  access: AccessSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyToken'],
    symbol: ['MTK'],
    decimals: ['6', '18'],
    burnable: booleans,
    pausable: booleans,
    mintable: booleans,
    premint: ['1'],
    votes: booleans,
    appName: ['MyApp'],
    appVersion: ['v1'],
    access: resolveAccessControlOptions(opts.access),
    upgradeable: upgradeableOptions,
    info: infoOptions,
  };
}

export function* generateERC20Options(opts: GeneratorOptions): Generator<Required<ERC20Options>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
