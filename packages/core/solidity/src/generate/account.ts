import { ERC7579ModulesOptions, SignatureValidationOptions, type AccountOptions } from '../account';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { SignerOptions } from '../signer';
import { generateAlternatives } from './alternatives';

const booleans = [true, false] as const;

const account = {
  name: ['MyAccount'],
<<<<<<< HEAD
  signatureValidation: SignatureValidationOptions,
  ERC721Holder: booleans,
  ERC1155Holder: booleans,
  signer: SignerOptions,
  batchedExecution: booleans,
  ERC7579Modules: ERC7579ModulesOptions,
=======
  signatureValidation: [false, 'ERC1271', 'ERC7739'] as const,
  ERC721Holder: [false, true] as const,
  ERC1155Holder: [false, true] as const,
  signer: ['ECDSA', 'EIP7702', 'Multisig', 'MultisigWeighted', 'P256', 'RSA', 'WebAuthn'] as const,
  batchedExecution: [false, true] as const,
  ERC7579Modules: [false, 'AccountERC7579', 'AccountERC7579Hooked'] as const,
>>>>>>> master
  access: [false] as const,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateAccountOptions(): Generator<Required<AccountOptions>> {
  yield* generateAlternatives(account);
}
