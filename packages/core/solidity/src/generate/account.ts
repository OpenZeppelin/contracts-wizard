import type { AccountOptions } from '../account';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const account = {
  name: ['MyAccount'],
  signatureValidation: [false, 'ERC1271', 'ERC7739'] as const,
  ERC721Holder: [false, true] as const,
  ERC1155Holder: [false, true] as const,
  signer: ['ECDSA', 'EIP7702', 'Multisig', 'MultisigWeighted', 'P256', 'RSA', 'WebAuthn'] as const,
  batchedExecution: [false, true] as const,
  ERC7579Modules: [false, 'AccountERC7579', 'AccountERC7579Hooked'] as const,
  access: [false] as const,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateAccountOptions(): Generator<Required<AccountOptions>> {
  yield* generateAlternatives(account);
}
