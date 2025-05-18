import type { ERC7579Options } from '../erc7579';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const erc7579 = {
  name: ['MyERC7579'],
  type: [false, 'Validator', 'Executor', 'DelayedExecutor', 'FallbackHandler', 'Hook'] as const,
  multisig: [false, 'ERC7579Multisig', 'ERC7579MultisigConfirmation', 'ERC7579MultisigWeighted'] as const,
  access: accessOptions,
  upgradeable: [false] as const,
  info: infoOptions,
};

export function* generateERC7579Options(): Generator<Required<ERC7579Options>> {
  yield* generateAlternatives(erc7579);
}
