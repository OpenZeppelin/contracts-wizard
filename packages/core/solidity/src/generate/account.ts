import type { AccountOptions } from '../account';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const account = {
  name: ['MyAccount'],
  ERC1271: [false, 'ERC1271', 'ERC7739'] as const,
  ERC721Holder: [false, true] as const,
  ERC1155Holder: [false, true] as const,
  signer: ['ERC7702', 'ECDSA', 'P256', 'RSA'] as const,
  ERC7821: [false, true] as const,
  ERC7579: [false, 'AccountERC7579', 'AccountERC7579Hooked'] as const,
  access: [false] as const,
  upgradeable: [false] as const,
  info: infoOptions,
};

export function* generateAccountOptions(): Generator<Required<AccountOptions>> {
  yield* generateAlternatives(account);
}
