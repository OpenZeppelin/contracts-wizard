import type { AccountOptions } from '../account';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const account = {
  name: ['MyAccount'],
  accountBase: ['Account', 'AccountCore'] as const,
  signer: ['ECDSA', 'P256', 'RSA'] as const,
  ERC7579: [false, true] as const,
  ERC7579Hooks: [false, true] as const,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateAccountOptions(): Generator<Required<AccountOptions>> {
  yield* generateAlternatives(account);
}
