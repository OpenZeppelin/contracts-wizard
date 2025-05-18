import type { ERC7579Options } from '../erc7579';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const erc7579 = {
  name: ['MyERC7579'],
  validator: [
    {
      signature: false,
      multisig: {
        weighted: false,
        confirmation: false,
      },
    },
  ] as const,
  executor: [
    {
      delayed: false,
    },
  ] as const,
  hook: [false] as const,
  fallback: [false] as const,
  access: accessOptions,
  upgradeable: [false] as const,
  info: infoOptions,
};

export function* generateERC7579Options(): Generator<Required<ERC7579Options>> {
  yield* generateAlternatives(erc7579);
}
