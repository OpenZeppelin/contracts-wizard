import type { PaymasterOptions } from '../paymaster';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const paymaster = {
  name: ['MyPaymaster'],
  signer: ['ERC7702', 'ECDSA', 'P256', 'RSA'] as const,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generatePaymasterOptions(): Generator<Required<PaymasterOptions>> {
  yield* generateAlternatives(paymaster);
}
