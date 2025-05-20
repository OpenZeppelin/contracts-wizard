import { ContractBuilder } from './contract';
import type { Contract } from './contract';
import { defineFunctions } from './utils/define-functions';
import { printContract } from './print';
import { defaults as commonDefaults, withCommonDefaults, type CommonOptions } from './common-options';
import { setInfo } from './set-info';
import { addSigner, signerFunctions, signers, type SignerOptions } from './signer';

export const defaults: Required<AccountOptions> = {
  ...commonDefaults,
  name: 'MyAccount',
  signatureValidation: 'ERC7739',
  ERC721Holder: true,
  ERC1155Holder: true,
  signer: 'ECDSA',
  batchedExecution: false,
  ERC7579Modules: false,
} as const;

export const SignatureValidationOptions = [false, 'ERC1271', 'ERC7739'] as const;
export type SignatureValidationOptions = (typeof SignatureValidationOptions)[number];

export const ERC7579ModulesOptions = [false, 'AccountERC7579', 'AccountERC7579Hooked'] as const;
export type ERC7579ModulesOptions = (typeof ERC7579ModulesOptions)[number];

export interface AccountOptions extends CommonOptions {
  name: string;
  signatureValidation?: SignatureValidationOptions;
  ERC721Holder?: boolean;
  ERC1155Holder?: boolean;
  signer?: SignerOptions;
  batchedExecution?: boolean;
  ERC7579Modules?: ERC7579ModulesOptions;
}

function withDefaults(opts: AccountOptions): Required<AccountOptions> {
  return {
    ...withCommonDefaults(opts),
    name: opts.name ?? defaults.name,
    signatureValidation: opts.signatureValidation ?? defaults.signatureValidation,
    ERC721Holder: opts.ERC721Holder ?? defaults.ERC721Holder,
    ERC1155Holder: opts.ERC1155Holder ?? defaults.ERC1155Holder,
    signer: opts.signer ?? defaults.signer,
    batchedExecution: opts.batchedExecution ?? defaults.batchedExecution,
    ERC7579Modules: opts.ERC7579Modules ?? defaults.ERC7579Modules,
  };
}

export function printAccount(opts: AccountOptions = defaults): string {
  return printContract(buildAccount(opts));
}

export function buildAccount(opts: AccountOptions): Contract {
  const allOpts = withDefaults(opts);

  allOpts.upgradeable = false; // Upgradeability is not yet available for the community contracts
  allOpts.access = false; // Access control options are not used for Account

  const c = new ContractBuilder(allOpts.name);

  addParents(c, allOpts);
  overrideRawSignatureValidation(c, allOpts);
  setInfo(c, allOpts.info);

  if (opts.ERC7579Modules) {
    c.addImportOnly({
      name: 'PackedUserOperation',
      path: '@openzeppelin/contracts/interfaces/draft-IERC4337.sol',
    });
  }

  return c;
}

function addParents(c: ContractBuilder, opts: AccountOptions): void {
  // Base
  c.addParent({
    name: 'Account',
    path: `@openzeppelin/community-contracts/account/Account.sol`,
  });
  c.addOverride({ name: 'Account' }, functions._validateUserOp);

  if (opts.signatureValidation === 'ERC7739') addEIP712(c, opts);

  // Extensions
  addSignatureValidation(c, opts);
  addERC7579Modules(c, opts);
  addSigner(c, opts.signer ?? false);
  addMultisigFunctions(c, opts);
  addBatchedExecution(c, opts);
  addERC721Holder(c, opts);
  addERC1155Holder(c, opts);
}

function addSignatureValidation(c: ContractBuilder, opts: AccountOptions) {
  switch (opts.signatureValidation) {
    case 'ERC7739':
      c.addParent({
        name: 'ERC7739',
        path: '@openzeppelin/community-contracts/utils/cryptography/ERC7739.sol',
      });
      break;
    case 'ERC1271':
      c.addParent({
        name: 'IERC1271',
        path: '@openzeppelin/contracts/interfaces/IERC1271.sol',
      });
      c.addOverride({ name: 'IERC1271' }, functions.isValidSignature);
      if (!opts.ERC7579Modules) {
        c.setFunctionBody(
          [
            'return _rawSignatureValidation(hash, signature) ? IERC1271.isValidSignature.selector : bytes4(0xffffffff);',
          ],
          functions.isValidSignature,
        );
      }
      break;
  }
}

function addERC721Holder(c: ContractBuilder, opts: AccountOptions): void {
  if (!opts.ERC721Holder) return;
  c.addParent({
    name: 'ERC721Holder',
    path: '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol',
  });
}

function addERC1155Holder(c: ContractBuilder, opts: AccountOptions): void {
  if (!opts.ERC1155Holder) return;
  c.addParent({
    name: 'ERC1155Holder',
    path: '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol',
  });
}

function addBatchedExecution(c: ContractBuilder, opts: AccountOptions): void {
  // ERC-7579 is a superset of ERC-7821
  if (!opts.batchedExecution || !!opts.ERC7579Modules) return;
  c.addParent({
    name: 'ERC7821',
    path: '@openzeppelin/community-contracts/account/extensions/ERC7821.sol',
  });
  c.addOverride({ name: 'ERC7821' }, functions._erc7821AuthorizedExecutor);
  c.setFunctionBody(
    ['return caller == address(entryPoint()) || super._erc7821AuthorizedExecutor(caller, mode, executionData);'],
    functions._erc7821AuthorizedExecutor,
  );
}

function addERC7579Modules(c: ContractBuilder, opts: AccountOptions): void {
  if (!opts.ERC7579Modules) return;
  c.addParent({
    name: opts.ERC7579Modules,
    path: `@openzeppelin/community-contracts/account/extensions/${opts.ERC7579Modules}.sol`,
  });
  if (opts.ERC7579Modules !== 'AccountERC7579') {
    c.addImportOnly({
      name: 'AccountERC7579',
      path: `@openzeppelin/community-contracts/account/extensions/AccountERC7579.sol`,
    });
  }
  c.addOverride({ name: 'AccountERC7579' }, functions.isValidSignature);
  c.addOverride({ name: 'AccountERC7579' }, functions._validateUserOp);

  if (opts.signatureValidation !== 'ERC7739') return;
  c.addOverride({ name: 'ERC7739' }, functions.isValidSignature);
  c.setFunctionBody(
    [
      '// ERC-7739 can return the ERC-1271 magic value, 0xffffffff (invalid) or 0x77390001 (detection).',
      '// If the returned value is 0xffffffff, fallback to ERC-7579 validation.',
      'bytes4 erc7739magic = ERC7739.isValidSignature(hash, signature);',
      'return erc7739magic == bytes4(0xffffffff) ? AccountERC7579.isValidSignature(hash, signature) : erc7739magic;',
    ],
    functions.isValidSignature,
  );
}

function addMultisigFunctions(c: ContractBuilder, opts: AccountOptions): void {
  switch (opts.signer) {
    case 'MultisigWeighted':
      c.addFunctionCode(
        `_setSignerWeights(${functions.setSignerWeights.args.map(({ name }) => name).join(', ')});`,
        functions.setSignerWeights,
      );
    // eslint-disable-next-line no-fallthrough
    case 'Multisig':
      c.addFunctionCode(`_addSigners(${functions.addSigners.args[0]!.name});`, functions.addSigners);
      c.addFunctionCode(`_removeSigners(${functions.removeSigners.args[0]!.name});`, functions.removeSigners);
      c.addFunctionCode(`_setThreshold(${functions.setThreshold.args[0]!.name});`, functions.setThreshold);
      break;
    default:
  }
}

function addEIP712(c: ContractBuilder, opts: AccountOptions): void {
  if (opts.signatureValidation != 'ERC7739') return;
  c.addParent(
    {
      name: 'EIP712',
      path: '@openzeppelin/contracts/utils/cryptography/EIP712.sol',
    },
    [opts.name, '1'],
  );
}

function overrideRawSignatureValidation(c: ContractBuilder, opts: AccountOptions): void {
  if (opts.signer && !opts.ERC7579Modules) return; // Signer implements _rawSignatureValidation alone
  if (!opts.signer && opts.ERC7579Modules) return; // AccountERC7579 implements _rawSignatureValidation alone

  // If no signer or ERC-7579 is used, we need to override the _rawSignatureValidation function
  // to provide a custom validation logic
  if (!opts.signer && !opts.ERC7579Modules) {
    // Custom validation logic
    c.addOverride({ name: 'Account' }, signerFunctions._rawSignatureValidation);
    c.setFunctionBody(['// Custom validation logic', 'return false;'], signerFunctions._rawSignatureValidation);
  }

  // Disambiguate between Signer and AccountERC7579
  if (opts.signer && opts.ERC7579Modules) {
    c.addImportOnly({
      name: 'AbstractSigner',
      path: '@openzeppelin/community-contracts/utils/cryptography/AbstractSigner.sol',
    });
    c.addOverride({ name: 'AbstractSigner' }, signerFunctions._rawSignatureValidation);
    c.addOverride({ name: 'AccountERC7579' }, signerFunctions._rawSignatureValidation);
    c.setFunctionComments(
      [
        `// IMPORTANT: Make sure Signer${opts.signer} is most derived than AccountERC7579`,
        `// in the inheritance chain (i.e. contract ... is AccountERC7579, ..., Signer${opts.signer})`,
        '// to ensure the correct order of function resolution.',
        '// AccountERC7579 returns false for `_rawSignatureValidation`',
      ],
      signerFunctions._rawSignatureValidation,
    );
    // Base override for `_rawSignatureValidation` given MultiSignerERC7913Weighted is MultiSignerERC7913
    if (opts.signer === 'MultisigWeighted') {
      c.addImportOnly(signers.Multisig);
    }
  }
}

const functions = {
  ...defineFunctions({
    isValidSignature: {
      kind: 'public' as const,
      mutability: 'view' as const,
      args: [
        { name: 'hash', type: 'bytes32' },
        { name: 'signature', type: 'bytes calldata' },
      ],
      returns: ['bytes4'],
    },
    _validateUserOp: {
      kind: 'internal' as const,
      args: [
        { name: 'userOp', type: 'PackedUserOperation calldata' },
        { name: 'userOpHash', type: 'bytes32' },
      ],
      returns: ['uint256'],
    },
    _erc7821AuthorizedExecutor: {
      kind: 'internal' as const,
      args: [
        { name: 'caller', type: 'address' },
        { name: 'mode', type: 'bytes32' },
        { name: 'executionData', type: 'bytes calldata' },
      ],
      returns: ['bool'],
      mutability: 'view' as const,
    },
    addSigners: {
      kind: 'public' as const,
      args: [{ name: 'signers', type: 'bytes[] memory' }],
    },
    removeSigners: {
      kind: 'public' as const,
      args: [{ name: 'signers', type: 'bytes[] memory' }],
    },
    setThreshold: {
      kind: 'public' as const,
      args: [{ name: 'threshold', type: 'uint256' }],
    },
    setSignerWeights: {
      kind: 'public' as const,
      args: [
        { name: 'signers', type: 'bytes[] memory' },
        { name: 'weights', type: 'uint256[] memory' },
      ],
    },
  }),
};
