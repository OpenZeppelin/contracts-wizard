import { ContractBuilder } from './contract';
import type { Contract } from './contract';
import { defineFunctions } from './utils/define-functions';
import { printContract } from './print';
import { defaults as commonDefaults, withCommonDefaults, type CommonOptions } from './common-options';
import { setInfo } from './set-info';
import { addSigner, signerFunctions, type SignerOptions } from './signer';

export const defaults: Required<AccountOptions> = {
  ...commonDefaults,
  name: 'MyAccount',
  ERC1271: 'ERC7739',
  ERC721Holder: true,
  ERC1155Holder: true,
  signer: false,
  ERC7821: false,
  ERC7579: false,
} as const;

export const ERC1271Options = [false, 'ERC1271', 'ERC7739'] as const;
export type ERC1271Options = (typeof ERC1271Options)[number];

export const ERC7579Options = [false, 'AccountERC7579', 'AccountERC7579Hooked'] as const;
export type ERC7579Options = (typeof ERC7579Options)[number];

export interface AccountOptions extends CommonOptions {
  name: string;
  ERC1271?: ERC1271Options;
  ERC721Holder?: boolean;
  ERC1155Holder?: boolean;
  signer?: SignerOptions;
  ERC7821: boolean;
  ERC7579?: ERC7579Options;
}

function withDefaults(opts: AccountOptions): Required<AccountOptions> {
  return {
    ...withCommonDefaults(opts),
    name: opts.name ?? defaults.name,
    ERC1271: opts.ERC1271 ?? defaults.ERC1271,
    ERC721Holder: opts.ERC721Holder ?? defaults.ERC721Holder,
    ERC1155Holder: opts.ERC1155Holder ?? defaults.ERC1155Holder,
    signer: opts.signer ?? defaults.signer,
    ERC7821: opts.ERC7821 ?? defaults.ERC7821,
    ERC7579: opts.ERC7579 ?? defaults.ERC7579,
  };
}

export function printAccount(opts: AccountOptions = defaults): string {
  return printContract(buildAccount(opts));
}

export function isAccessControlRequired(opts: Partial<AccountOptions>): boolean {
  return false;
}

export function buildAccount(opts: AccountOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  addParents(c, allOpts);
  overrideRawSignatureValidation(c, allOpts);
  setInfo(c, allOpts.info);

  if (!!opts.ERC7579) {
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
    path: `@openzeppelin/community-contracts/contracts/account/Account.sol`,
  });
  c.addOverride({ name: 'Account' }, functions._validateUserOp);

  if (opts.ERC1271 === 'ERC7739') addEIP712(c, opts);

  // Extensions
  addERC7579(c, opts);
  addERC1271(c, opts);
  addSigner(c, opts.signer ?? false);
  addERC7821(c, opts);
  addERC721Holder(c, opts);
  addERC1155Holder(c, opts);
}

function addERC1271(c: ContractBuilder, opts: AccountOptions) {
  switch (opts.ERC1271) {
    case 'ERC7739':
      c.addParent({
        name: 'ERC7739',
        path: '@openzeppelin/community-contracts/contracts/utils/cryptography/ERC7739.sol',
      });
      break;
    case 'ERC1271':
      c.addParent({
        name: 'IERC1271',
        path: '@openzeppelin/contracts/interfaces/IERC1271.sol',
      });
      c.addOverride({ name: 'IERC1271' }, functions.isValidSignature);
      if (!opts.ERC7579) {
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

function addERC7821(c: ContractBuilder, opts: AccountOptions): void {
  // ERC-7579 is a superset of ERC-7821
  if (!opts.ERC7821 || !!opts.ERC7579) return;
  c.addParent({
    name: 'ERC7821',
    path: '@openzeppelin/community-contracts/contracts/account/extensions/ERC7821.sol',
  });
  c.addOverride({ name: 'ERC7821' }, functions._erc7821AuthorizedExecutor);
  c.setFunctionBody(
    ['return caller == address(entryPoint()) || super._erc7821AuthorizedExecutor(caller, mode, executionData);'],
    functions._erc7821AuthorizedExecutor,
  );
}

function addERC7579(c: ContractBuilder, opts: AccountOptions): void {
  if (!opts.ERC7579) return;
  c.addParent({
    name: opts.ERC7579,
    path: `@openzeppelin/community-contracts/contracts/account/extensions/${opts.ERC7579}.sol`,
  });
  if (opts.ERC7579 !== 'AccountERC7579') {
    c.addImportOnly({
      name: 'AccountERC7579',
      path: `@openzeppelin/community-contracts/contracts/account/extensions/AccountERC7579.sol`,
    });
  }
  c.addOverride({ name: 'AccountERC7579' }, functions.isValidSignature);
  c.addOverride({ name: 'AccountERC7579' }, functions._validateUserOp);

  if (opts.ERC1271 !== 'ERC7739') return;
  c.addOverride({ name: 'ERC7739' }, functions.isValidSignature);
  c.setFunctionBody(
    [
      '// ERC-7739 can return the fn selector (success), 0xffffffff (invalid) or 0x77390001 (detection).',
      '// If the return is 0xffffffff, we fallback to validation using ERC-7579 modules.',
      'bytes4 erc7739magic = ERC7739.isValidSignature(hash, signature);',
      'return erc7739magic == bytes4(0xffffffff) ? AccountERC7579.isValidSignature(hash, signature) : erc7739magic;',
    ],
    functions.isValidSignature,
  );
}

function addEIP712(c: ContractBuilder, opts: AccountOptions): void {
  if (opts.ERC1271 != 'ERC7739') return;
  c.addParent(
    {
      name: 'EIP712',
      path: '@openzeppelin/contracts/utils/cryptography/EIP712.sol',
    },
    [opts.name, '1'],
  );
}

function overrideRawSignatureValidation(c: ContractBuilder, opts: AccountOptions): void {
  if (opts.signer && !opts.ERC7579) return; // Signer implements _rawSignatureValidation alone
  if (!opts.signer && opts.ERC7579) return; // AccountERC7579 implements _rawSignatureValidation alone

  // If no signer or ERC-7579 is used, we need to override the _rawSignatureValidation function
  // to provide a custom validation logic
  if (!opts.signer && !opts.ERC7579) {
    // Custom validation logic
    c.addOverride({ name: 'Account' }, signerFunctions._rawSignatureValidation);
    c.setFunctionBody(['// Custom validation logic', 'return false;'], signerFunctions._rawSignatureValidation);
  }

  // Dissambiguate between Signer and AccountERC7579
  if (opts.signer && opts.ERC7579) {
    c.addImportOnly({
      name: 'AbstractSigner',
      path: '@openzeppelin/community-contracts/contracts/utils/cryptography/AbstractSigner.sol',
    });
    c.addOverride({ name: 'AbstractSigner' }, signerFunctions._rawSignatureValidation);
    c.addOverride({ name: 'AccountERC7579' }, signerFunctions._rawSignatureValidation);
    c.addFunctionCode(
      '// Force signer validation first, and fallback to ERC-7579',
      signerFunctions._rawSignatureValidation,
    );
    c.addFunctionCode(
      `// return Signer${opts.signer}._rawSignatureValidation(hash, signature) || AccountERC7579._rawSignatureValidation(hash, signature);`,
      signerFunctions._rawSignatureValidation,
    );
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
  }),
};
