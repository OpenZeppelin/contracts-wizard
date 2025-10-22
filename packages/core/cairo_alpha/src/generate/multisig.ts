import { infoOptions } from '../set-info';
import type { MultisigOptions } from '../multisig';
import { generateAlternatives } from './alternatives';
import { resolveMacrosOptions } from '../set-macros';

const blueprint = {
  name: ['MyMultisig'],
  quorum: ['1', '2', '42'],
  upgradeable: [true, false],
  info: infoOptions,
  macros: resolveMacrosOptions('all'),
};

export function* generateMultisigOptions(): Generator<Required<MultisigOptions>> {
  yield* generateAlternatives(blueprint);
}
