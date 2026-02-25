import type { GovernorOptions } from '../governor';
import { clockModeOptions, quorumModeOptions, timelockOptions, votesOptions } from '../governor';
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
    name: ['MyGovernor'],
    delay: ['1 day'],
    period: ['1 week'],
    proposalThreshold: ['1'],
    decimals: [18],
    quorumMode: quorumModeOptions,
    quorumPercent: [10],
    quorumAbsolute: ['10'],
    votes: votesOptions,
    clockMode: clockModeOptions,
    timelock: timelockOptions,
    settings: booleans,
    appName: ['Openzeppelin Governor'],
    appVersion: ['v1'],
    upgradeable: upgradeableOptions,
    info: infoOptions,
    macros: resolveMacrosOptions(opts.macros),
  };
}

export function* generateGovernorOptions(opts: GeneratorOptions): Generator<Required<GovernorOptions>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
