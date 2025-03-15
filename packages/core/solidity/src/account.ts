import { ContractBuilder } from './contract';
import type { Contract } from './contract';
import { defineFunctions } from './utils/define-functions';
import { printContract } from './print';
import { defaults as commonDefaults, withCommonDefaults, type CommonOptions } from './common-options';

export const defaults: Required<AccountOptions> = {
  ...commonDefaults,
  name: 'MyAccount',
  accountBase: 'Account',
  signer: false,
  ERC7579: false,
  ERC7579Hooks: false,
} as const;

export const accountBaseOptions = ['AccountCore', 'Account'] as const;
export type AccountBaseOptions = (typeof accountBaseOptions)[number];

export const SignerOptions = [false, 'ECDSA', 'P256', 'RSA'] as const;
export type SignerOptions = (typeof SignerOptions)[number];

export interface AccountOptions extends CommonOptions {
  name: string;
  accountBase: AccountBaseOptions;
  signer?: SignerOptions;
  ERC7579: boolean;
  ERC7579Hooks: boolean;
}

function withDefaults(opts: AccountOptions): Required<AccountOptions> {
  return {
    ...withCommonDefaults(opts),
    name: opts.name ?? defaults.name,
    accountBase: opts.accountBase ?? defaults.accountBase,
    signer: opts.signer ?? defaults.signer,
    ERC7579: opts.ERC7579 ?? defaults.ERC7579,
    ERC7579Hooks: opts.ERC7579Hooks ?? defaults.ERC7579Hooks,
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

  c.addImportOnly({
    name: 'PackedUserOperation',
    path: '@openzeppelin/contracts/interfaces/draft-IERC4337.sol',
  });
  addBase(c, allOpts);
  addEIP712(c, allOpts);
  addSigners(c, allOpts);
  addSignatureValidation(c, allOpts);
  addSignatureUserOpHash(c, allOpts);
  return c;
}

function getBaseName(opts: AccountOptions): string {
  const ERC7579BaseName = opts.ERC7579Hooks ? 'AccountERC7579Hooked' : 'AccountERC7579';
  return opts.ERC7579 ? ERC7579BaseName : opts.accountBase;
}

function addBase(c: ContractBuilder, opts: AccountOptions): void {
  const baseName = getBaseName(opts);
  const accountFolder = '@openzeppelin/community-contracts/account/';
  let path = accountFolder;
  if (opts.ERC7579) {
    path += 'extensions/';
  }
  path += `${baseName}.sol`;
  c.addParent({
    name: baseName,
    path,
  });
}

function addEIP712(c: ContractBuilder, opts: AccountOptions): void {
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

function addSigners(c: ContractBuilder, opts: AccountOptions): void {
  if (opts.signer) {
    c.addParent({
      name: `Signer${opts.signer}`,
      path: `@openzeppelin/community-contracts/utils/cryptography/Signer${opts.signer}.sol`,
    });
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
}

function addSignatureValidation(c: ContractBuilder, opts: AccountOptions): void {
  if (opts.signer && opts.ERC7579) {
    if (getBaseName(opts) !== 'AccountERC7579') {
      c.addImportOnly({
        name: 'AccountERC7579',
        path: '@openzeppelin/community-contracts/account/extensions/AccountERC7579.sol',
      });
    }
    c.addOverride({ name: 'AccountERC7579' }, functions._rawSignatureValidation);
    c.addOverride({ name: `Signer${opts.signer}` }, functions._rawSignatureValidation);
  } else if (opts.signer) {
    c.addOverride({ name: getBaseName(opts) }, functions._rawSignatureValidation);
  } else if (!opts.signer && !opts.ERC7579) {
    c.addOverride({ name: getBaseName(opts) }, functions._rawSignatureValidation);
    c.setFunctionBody(['// Custom validation logic', 'return false;'], functions._rawSignatureValidation);
  } else {
    c.addOverride({ name: 'Account' }, functions._rawSignatureValidation);
  }
}

function addSignatureUserOpHash(c: ContractBuilder, opts: AccountOptions): void {
  c.addOverride({ name: getBaseName(opts) }, functions._signableUserOpHash);
  if (opts.accountBase !== 'Account') {
    c.setFunctionBody(['// Hash can be overriden', 'return userOpHash;'], functions._signableUserOpHash);
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
