import { ContractBuilder } from './contract';
import type { Contract } from './contract';
import { defineFunctions } from './utils/define-functions';
import { printContract } from './print';
import { defaults as commonDefaults, withCommonDefaults, type CommonOptions } from './common-options';
import { setInfo } from './set-info';

export const defaults: Required<AccountOptions> = {
  ...commonDefaults,
  name: 'MyAccount',
  accountBase: 'Account',
  signer: false,
  ERC7579: false,
} as const;

export const accountBaseOptions = ['AccountCore', 'Account'] as const;
export type AccountBaseOptions = (typeof accountBaseOptions)[number];

export const SignerOptions = [false, 'ERC7702', 'ECDSA', 'P256', 'RSA'] as const;
export type SignerOptions = (typeof SignerOptions)[number];

export const ERC7579Options = [false, 'AccountERC7579', 'AccountERC7579Hooked'] as const;
export type ERC7579Options = (typeof ERC7579Options)[number];

export interface AccountOptions extends CommonOptions {
  name: string;
  accountBase: AccountBaseOptions;
  signer?: SignerOptions;
  ERC7579?: ERC7579Options;
}

function withDefaults(opts: AccountOptions): Required<AccountOptions> {
  return {
    ...withCommonDefaults(opts),
    name: opts.name ?? defaults.name,
    accountBase: opts.accountBase ?? defaults.accountBase,
    signer: opts.signer ?? defaults.signer,
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

  addEIP712(c, allOpts);
  addParents(c, allOpts);
  overrideRawSignatureValidation(c, allOpts);
  setInfo(c, allOpts.info);

  if (allOpts.accountBase !== 'Account' || !!opts.ERC7579) {
    c.addImportOnly({
      name: 'PackedUserOperation',
      path: '@openzeppelin/contracts/interfaces/draft-IERC4337.sol',
    });
  }

  return c;
}

function addParents(c: ContractBuilder, opts: AccountOptions): void {
  // Base
  const baseName = opts.accountBase;
  c.addParent({
    name: baseName,
    path: `@openzeppelin/community-contracts/contracts/account/${baseName}.sol`,
  });
  const _validateUserOpOverrideFrom = opts.ERC7579 ? 'AccountCore' : baseName;
  if (_validateUserOpOverrideFrom === 'AccountCore' && baseName !== 'AccountCore') {
    c.addImportOnly({
      name: 'AccountCore',
      path: '@openzeppelin/community-contracts/contracts/account/AccountCore.sol',
    });
  }
  c.addOverride({ name: _validateUserOpOverrideFrom }, functions._validateUserOp);

  if (opts.accountBase !== 'Account') {
    c.addOverride({ name: opts.accountBase }, functions._signableUserOpHash);
    c.setFunctionBody(['// Hash can be overriden', 'return userOpHash;'], functions._signableUserOpHash);
  }

  // Extensions
  addERC7579(c, opts);
  addSigner(c, opts);
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
      path: '@openzeppelin/community-contracts/contracts/account/extensions/AccountERC7579.sol',
    });
  }
  c.addOverride({ name: 'AccountERC7579' }, functions._validateUserOp);
}

function addSigner(c: ContractBuilder, opts: AccountOptions): void {
  if (!opts.signer) return;
  c.addParent({
    name: `Signer${opts.signer}`,
    path: `@openzeppelin/community-contracts/contracts/utils/cryptography/Signer${opts.signer}.sol`,
  });
  c.addOverride({ name: `Signer${opts.signer}` }, functions._rawSignatureValidation);

  // ERC-7702 doesn't require initialization
  if (opts.signer === 'ERC7702') return;

  c.addParent({
    name: 'Initializable',
    path: '@openzeppelin/contracts/proxy/utils/Initializable.sol',
  });
  const fn = functions[`initialize${opts.signer}`];
  c.addModifier('initializer', fn);
  c.addFunctionCode(
    `_setSigner(${fn.args
      .map(({ name }) => name)
      .join(', ')
      .trimEnd()});`,
    fn,
  );
}

function addEIP712(c: ContractBuilder, opts: AccountOptions): void {
  // EIP712 is only required for the Account and AccountERC7579 (both use EIP-712 as part of ERC-7739)
  if (opts.accountBase === 'Account' || opts.ERC7579) {
    c.addParent(
      {
        name: 'EIP712',
        path: '@openzeppelin/contracts/utils/cryptography/EIP712.sol',
      },
      [opts.name, '1'],
    );
  }
}

function overrideRawSignatureValidation(c: ContractBuilder, opts: AccountOptions): void {
  if (opts.signer) {
    if (opts.ERC7579) {
      // Overriding `_rawSignatureValidation` will always come from the AbstractSigner and AccountERC7579
      c.addImportOnly({
        name: 'AbstractSigner',
        path: '@openzeppelin/community-contracts/contracts/utils/cryptography/AbstractSigner.sol',
      });
      c.addOverride({ name: 'AbstractSigner' }, functions._rawSignatureValidation);
      // If using `AccountERC7579Hooked`, the base contract won't be imported
      if (opts.ERC7579 === 'AccountERC7579Hooked') {
        c.addImportOnly({
          name: 'AccountERC7579',
          path: '@openzeppelin/community-contracts/contracts/account/extensions/AccountERC7579.sol',
        });
      }
      c.addOverride({ name: 'AccountERC7579' }, functions._rawSignatureValidation);
      c.addFunctionCode(
        '// Force signer validation first, and fallback to ERC-7579',
        functions._rawSignatureValidation,
      );
      c.addFunctionCode(
        `// return Signer${opts.signer}._rawSignatureValidation(hash, signature) || AccountERC7579._rawSignatureValidation(hash, signature);`,
        functions._rawSignatureValidation,
      );
    } else {
      // Signer implements _rawSignatureValidation alone
    }
  } else {
    if (opts.ERC7579) {
      // AccountERC7579 implements _rawSignatureValidation alone
    } else {
      // Custom validation logic
      c.addOverride({ name: opts.accountBase }, functions._rawSignatureValidation);
      c.setFunctionBody(['// Custom validation logic', 'return false;'], functions._rawSignatureValidation);
    }
  }
}

const functions = {
  ...defineFunctions({
    initializeECDSA: {
      kind: 'public' as const,
      args: [{ name: 'signer', type: 'address' }],
    },
    initializeP256: {
      kind: 'public' as const,
      args: [
        { name: 'qx', type: 'bytes32' },
        { name: 'qy', type: 'bytes32' },
      ],
    },
    initializeRSA: {
      kind: 'public' as const,
      args: [
        { name: 'e', type: 'bytes memory' },
        { name: 'n', type: 'bytes memory' },
      ],
    },
    _rawSignatureValidation: {
      kind: 'internal' as const,
      args: [
        { name: 'hash', type: 'bytes32' },
        { name: 'signature', type: 'bytes calldata' },
      ],
      returns: ['bool'],
      mutability: 'view' as const,
    },
    _signableUserOpHash: {
      kind: 'internal' as const,
      args: [
        { name: 'userOp', type: 'PackedUserOperation calldata' },
        { name: 'userOpHash', type: 'bytes32' },
      ],
      returns: ['bytes32'],
      mutability: 'view' as const,
    },
    _validateUserOp: {
      kind: 'internal' as const,
      args: [
        { name: 'userOp', type: 'PackedUserOperation calldata' },
        { name: 'userOpHash', type: 'bytes32' },
      ],
      returns: ['uint256'],
    },
  }),
};
