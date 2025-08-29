import { ContractBuilder } from './contract';
import type { Contract } from './contract';
import { defineFunctions } from './utils/define-functions';
import { printContract } from './print';
import { makeUpgradeable } from './helpers';
import { defaults as commonDefaults, withCommonDefaults, type CommonOptions } from './common-options';
import { setInfo } from './set-info';
import {
  addLockingConstructorAllowReachable,
  addSigner,
  signerArgs,
  signerFunctions,
  signers,
  type SignerOptions,
} from './signer';
import { setUpgradeableAccount } from './set-upgradeable';

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

  allOpts.access = false; // Access control options are not used for Account

  const c = new ContractBuilder(allOpts.name);

  addParents(c, allOpts);
  overrideRawSignatureValidation(c, allOpts);
  setUpgradeableAccount(c, allOpts.upgradeable);
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
    path: `@openzeppelin/contracts/account/Account.sol`,
  });
  c.addOverride({ name: 'Account' }, functions._validateUserOp);

  if (opts.signatureValidation === 'ERC7739') addEIP712(c, opts);

  // Extensions
  addSignatureValidation(c, opts);
  addERC7579Modules(c, opts);
  addSigner(c, opts.signer ?? false, opts.upgradeable ?? false);
  addSignerInitializer(c, opts);
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
        path: '@openzeppelin/contracts/utils/cryptography/signers/draft-ERC7739.sol',
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
    path: '@openzeppelin/contracts/account/extensions/draft-ERC7821.sol',
  });
  c.addOverride({ name: 'ERC7821' }, functions._erc7821AuthorizedExecutor);
  c.setFunctionBody(
    ['return caller == address(entryPoint()) || super._erc7821AuthorizedExecutor(caller, mode, executionData);'],
    functions._erc7821AuthorizedExecutor,
  );
}

function addERC7579Modules(c: ContractBuilder, opts: AccountOptions): void {
  if (!opts.ERC7579Modules) return;

  // Base AccountERC7579 account (upgradeable or not)
  const name = makeUpgradeable('AccountERC7579', opts.upgradeable);

  c.addParent({
    name: makeUpgradeable(opts.ERC7579Modules, opts.upgradeable),
    path: makeUpgradeable(
      `@openzeppelin/contracts/account/extensions/draft-${opts.ERC7579Modules}.sol`,
      opts.upgradeable,
    ),
  });
  if (opts.ERC7579Modules !== 'AccountERC7579') {
    c.addImportOnly({
      name: makeUpgradeable('AccountERC7579', opts.upgradeable),
      path: makeUpgradeable('@openzeppelin/contracts/account/extensions/draft-AccountERC7579.sol', opts.upgradeable),
    });
  }

  // Accounts that use ERC7579 without a signer must be constructed with at least one module (executor of validation)
  if (!opts.signer) {
    const args = [
      { type: 'uint256', name: 'moduleTypeId' },
      { type: 'address', name: 'module' },
      { type: 'bytes calldata', name: 'initData' },
    ];
    const body = [
      'require(moduleTypeId == MODULE_TYPE_VALIDATOR || moduleTypeId == MODULE_TYPE_EXECUTOR);',
      '_installModule(moduleTypeId, module, initData);',
    ];
    c.addParent({
      name: 'Initializable',
      path: '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol',
    });
    addLockingConstructorAllowReachableAccountFactory(c);

    const fn = { name: 'initialize', kind: 'public' as const, args };
    c.addModifier('initializer', fn);
    c.setFunctionBody(body, fn);
  }

  // isValidSignature override
  c.addOverride({ name }, functions.isValidSignature);
  if (opts.signatureValidation === 'ERC7739') {
    c.addOverride({ name: 'ERC7739' }, functions.isValidSignature);
    c.setFunctionBody(
      [
        '// ERC-7739 can return the ERC-1271 magic value, 0xffffffff (invalid) or 0x77390001 (detection).',
        '// If the returned value is 0xffffffff, fallback to ERC-7579 validation.',
        'bytes4 erc7739magic = ERC7739.isValidSignature(hash, signature);',
        `return erc7739magic == bytes4(0xffffffff) ? ${name}.isValidSignature(hash, signature) : erc7739magic;`,
      ],
      functions.isValidSignature,
    );
  }

  // _validateUserOp override
  c.addOverride({ name }, functions._validateUserOp);
}

function addSignerInitializer(c: ContractBuilder, opts: AccountOptions): void {
  if (opts.upgradeable) {
    if (!opts.signer) {
      addLockingConstructorAllowReachable(c);
    }
    return; // Initializer added in signer.ts
  }
  if (!opts.signer || opts.signer === 'ERC7702') return; // No initialization required

  c.addParent({
    name: 'Initializable',
    path: opts.upgradeable
      ? '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol'
      : '@openzeppelin/contracts/proxy/utils/Initializable.sol',
  });

  addLockingConstructorAllowReachableAccountFactory(c);

  const fn = { name: 'initialize', kind: 'public' as const, args: signerArgs[opts.signer] };
  c.addModifier('initializer', fn);

  switch (opts.signer) {
    case 'Multisig':
      c.addFunctionCode(`_addSigners(${signerArgs[opts.signer][0]!.name});`, fn);
      c.addFunctionCode(`_setThreshold(${signerArgs[opts.signer][1]!.name});`, fn);
      break;
    case 'MultisigWeighted':
      c.addFunctionCode(`_addSigners(${signerArgs[opts.signer][0]!.name});`, fn);
      c.addFunctionCode(
        `_setSignerWeights(${signerArgs[opts.signer][0]!.name}, ${signerArgs[opts.signer][1]!.name});`,
        fn,
      );
      c.addFunctionCode(`_setThreshold(${signerArgs[opts.signer][2]!.name});`, fn);
      break;
    case 'ECDSA':
    case 'P256':
    case 'RSA':
      c.addFunctionCode(`_setSigner(${signerArgs[opts.signer].map(({ name }) => name).join(', ')});`, fn);
      break;
  }
}

function addMultisigFunctions(c: ContractBuilder, opts: AccountOptions): void {
  switch (opts.signer) {
    case 'MultisigWeighted':
      c.addFunctionCode(
        `_setSignerWeights(${functions.setSignerWeights.args.map(({ name }) => name).join(', ')});`,
        functions.setSignerWeights,
      );
      c.addModifier('onlyEntryPointOrSelf', functions.setSignerWeights);
    // eslint-disable-next-line no-fallthrough
    case 'Multisig':
      c.addFunctionCode(`_addSigners(${functions.addSigners.args[0]!.name});`, functions.addSigners);
      c.addModifier('onlyEntryPointOrSelf', functions.addSigners);
      c.addFunctionCode(`_removeSigners(${functions.removeSigners.args[0]!.name});`, functions.removeSigners);
      c.addModifier('onlyEntryPointOrSelf', functions.removeSigners);
      c.addFunctionCode(`_setThreshold(${functions.setThreshold.args[0]!.name});`, functions.setThreshold);
      c.addModifier('onlyEntryPointOrSelf', functions.setThreshold);
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
    const accountName = makeUpgradeable('AccountERC7579', opts.upgradeable);
    const signerName = makeUpgradeable(`Signer${opts.signer}`, opts.upgradeable);

    c.addImportOnly({
      name: 'AbstractSigner',
      path: '@openzeppelin/contracts/utils/cryptography/signers/AbstractSigner.sol',
    });
    c.addOverride({ name: 'AbstractSigner' }, signerFunctions._rawSignatureValidation);
    c.addOverride({ name: accountName }, signerFunctions._rawSignatureValidation);
    c.setFunctionComments(
      [
        `// IMPORTANT: Make sure ${signerName} is most derived than ${accountName}`,
        `// in the inheritance chain (i.e. contract ... is ${accountName}, ..., ${signerName})`,
        '// to ensure the correct order of function resolution.',
        `// ${accountName} returns false for _rawSignatureValidation`,
      ],
      signerFunctions._rawSignatureValidation,
    );

    // Base override for `_rawSignatureValidation` given MultiSignerERC7913Weighted is MultiSignerERC7913
    if (opts.signer === 'MultisigWeighted') {
      c.addImportOnly({
        name: makeUpgradeable(signers.Multisig.name, opts.upgradeable),
        path: makeUpgradeable(signers.Multisig.path, opts.upgradeable),
      });
    }
  }
}

function addLockingConstructorAllowReachableAccountFactory(c: ContractBuilder): void {
  addLockingConstructorAllowReachable(c, [
    '// Accounts are typically deployed and initialized as clones during their first user op,',
    '// therefore, initializers are disabled for the implementation contract',
  ]);
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
      args: [{ name: 'threshold', type: 'uint64' }],
    },
    setSignerWeights: {
      kind: 'public' as const,
      args: [
        { name: 'signers', type: 'bytes[] memory' },
        { name: 'weights', type: 'uint64[] memory' },
      ],
    },
  }),
};
