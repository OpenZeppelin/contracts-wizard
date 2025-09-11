import { ERC7579ModulesOptions, SignatureValidationOptions, type AccountOptions } from '../account';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { SignerOptions } from '../signer';
import { generateAlternatives } from './alternatives';

const booleans = [true, false] as const;

const account = {
  name: ['MyAccount'],
  signatureValidation: SignatureValidationOptions,
  ERC721Holder: booleans,
  ERC1155Holder: booleans,
  signer: SignerOptions,
  batchedExecution: booleans,
  ERC7579Modules: ERC7579ModulesOptions,
  access: [false] as const,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateAccountOptions(): Generator<Required<AccountOptions>> {
  yield* generateAlternatives(account);
}
