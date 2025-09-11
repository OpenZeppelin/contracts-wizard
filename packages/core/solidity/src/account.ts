import { ContractBuilder } from './contract';
import type { Contract } from './contract';
import { defineFunctions } from './utils/define-functions';
import { printContract } from './print';
import { defaults as commonDefaults, withCommonDefaults, type CommonOptions } from './common-options';
import { OptionsError } from './error';
import { upgradeableName } from './options';
import { setInfo } from './set-info';
import { addSigner, signers, signerFunctions, type SignerOptions } from './signer';
import { setUpgradeableAccount } from './set-upgradeable';
import { formatLines } from './utils/format-lines';

export const defaults: Required<AccountOptions> = {
  ...commonDefaults,
  name: 'MyAccount',
  signatureValidation: 'ERC7739',
  ERC721Holder: true,
  ERC1155Holder: true,
  signer: 'ECDSA',
  batchedExecution: false,
  ERC7579Modules: false,
  factory: false,
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
  factory?: boolean;
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
    factory: false,
  };
}

export function printAccount(opts: AccountOptions = defaults): string {
  const account = buildAccount(opts);
  if (opts.factory) {
    const factory = buildFactory(account, opts);
    return printContract([account, factory]);
  } else {
    return printContract(account);
  }
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
      transpiled: false, // PackedUserOperation doesn't start with "I" so its not recognized as an "interface object"
    });
  }

  return c;
}

function addParents(c: ContractBuilder, opts: AccountOptions): void {
  // Base
  c.addParent({
    name: 'Account',
    path: `@openzeppelin/contracts/account/Account.sol`,
    transpiled: false,
  });
  c.addOverride({ name: 'Account', transpiled: false }, functions._validateUserOp);

  if (opts.signatureValidation === 'ERC7739') addEIP712(c, opts);

  // Extensions
  addSignatureValidation(c, opts);
  addERC7579Modules(c, opts);
  addSigner(c, opts.signer ?? false, opts.upgradeable ?? false);
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
        transpiled: false,
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
    transpiled: false,
  });
}

function addERC1155Holder(c: ContractBuilder, opts: AccountOptions): void {
  if (!opts.ERC1155Holder) return;
  c.addParent({
    name: 'ERC1155Holder',
    path: '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol',
    transpiled: false,
  });
}

function addBatchedExecution(c: ContractBuilder, opts: AccountOptions): void {
  // ERC-7579 is a superset of ERC-7821
  if (!opts.batchedExecution || !!opts.ERC7579Modules) return;
  c.addParent({
    name: 'ERC7821',
    path: '@openzeppelin/contracts/account/extensions/draft-ERC7821.sol',
    transpiled: false,
  });
  c.addOverride({ name: 'ERC7821', transpiled: false }, functions._erc7821AuthorizedExecutor);
  c.setFunctionBody(
    ['return caller == address(entryPoint()) || super._erc7821AuthorizedExecutor(caller, mode, executionData);'],
    functions._erc7821AuthorizedExecutor,
  );
}

function addERC7579Modules(c: ContractBuilder, opts: AccountOptions): void {
  if (!opts.ERC7579Modules) return;

  c.addParent({
    name: opts.ERC7579Modules,
    path: `@openzeppelin/contracts/account/extensions/draft-${opts.ERC7579Modules}.sol`,
  });
  if (opts.ERC7579Modules !== 'AccountERC7579') {
    c.addImportOnly({
      name: 'AccountERC7579',
      path: '@openzeppelin/contracts/account/extensions/draft-AccountERC7579.sol',
    });
  }

  // Accounts that use ERC7579 without a signer must be constructed with at least one module (executor of validation)
  if (!opts.signer) {
    c.addImportOnly({name: 'MODULE_TYPE_VALIDATOR', path: '@openzeppelin/contracts/interfaces/draft-IERC7579.sol', transpiled: false});
    c.addImportOnly({name: 'MODULE_TYPE_EXECUTOR', path: '@openzeppelin/contracts/interfaces/draft-IERC7579.sol', transpiled: false});
    c.addConstructorArgument({ type: 'uint256', name: 'moduleTypeId' });
    c.addConstructorArgument({ type: 'address', name: 'module' });
    c.addConstructorArgument({ type: 'bytes calldata', name: 'initData' });
    c.addConstructorCode('require(moduleTypeId == MODULE_TYPE_VALIDATOR || moduleTypeId == MODULE_TYPE_EXECUTOR);');
    c.addConstructorCode('_installModule(moduleTypeId, module, initData);');
  }

  c.addOverride({ name: 'AccountERC7579' }, functions._validateUserOp);
  c.addOverride({ name: 'AccountERC7579' }, functions.isValidSignature);

  if (opts.signatureValidation === 'ERC7739') {
    c.addOverride({ name: 'ERC7739', transpiled: false }, functions.isValidSignature);
    c.setFunctionBody(
      [
        '// ERC-7739 can return the ERC-1271 magic value, 0xffffffff (invalid) or 0x77390001 (detection).',
        '// If the returned value is 0xffffffff, fallback to ERC-7579 validation.',
        'bytes4 erc7739magic = ERC7739.isValidSignature(hash, signature);',
        `return erc7739magic == bytes4(0xffffffff) ? ${opts.upgradeable ? upgradeableName('AccountERC7579') : 'AccountERC7579'}.isValidSignature(hash, signature) : erc7739magic;`,
      ],
      functions.isValidSignature,
    );
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
      transpiled: false, // do not use the upgradeable variant for in Accounts
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
    c.addOverride({ name: 'Account', transpiled: false }, signerFunctions._rawSignatureValidation);
    c.setFunctionBody(['// Custom validation logic', 'return false;'], signerFunctions._rawSignatureValidation);
  }

  // Disambiguate between Signer and AccountERC7579
  if (opts.signer && opts.ERC7579Modules) {
    const accountName = opts.upgradeable ? upgradeableName('AccountERC7579') : 'AccountERC7579';
    const signerName = opts.upgradeable ? upgradeableName(`Signer${opts.signer}`) : `Signer${opts.signer}`;

    c.addImportOnly({
      name: 'AbstractSigner',
      path: '@openzeppelin/contracts/utils/cryptography/signers/AbstractSigner.sol',
      transpiled: false,
    });
    c.addOverride({ name: 'AbstractSigner', transpiled: false }, signerFunctions._rawSignatureValidation);
    c.addOverride({ name: 'AccountERC7579' }, signerFunctions._rawSignatureValidation);
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
      c.addImportOnly(signers.Multisig);
    }
  }
}

export function buildFactory(account: Contract, opts: AccountOptions): Contract {
  if (opts.signer === 'ERC7702') {
    throw new OptionsError({ factory: 'Factory cannot deploy accounts with ERC-7702 signers' });
  }
  if (!opts.signer && !opts.ERC7579Modules) {
    throw new OptionsError({ factory: 'Factory requires the account to have an initializable signer or module' });
  }

  const factory = new ContractBuilder(account.name + 'Factory');
  const args = [...account.constructorArgs, { name: 'salt', type: 'bytes32' }];

  // Implementation address
  factory.addVariable(`${account.name} public immutable implementation = new ${account.name}();`);

  switch(opts.upgradeable) {
    case 'transparent': {
      // Import helpers
      factory.addImportOnly({
        name: 'Clones',
        path: '@openzeppelin/contracts/proxy/Clones.sol',
      });

      // Functions - create
      factory.setFunctionBody(
        formatLines([
          `bytes32 effectiveSalt = _salt(${args.map(arg => arg.name).join(', ')});`,
          `address instance = Clones.predictDeterministicAddress(address(implementation), effectiveSalt);`,
          `if (instance.code.length == 0) {`,
          [
            `Clones.cloneDeterministic(address(implementation), effectiveSalt);`,
            `${account.name}(instance).initialize(${account.constructorArgs.map(arg => arg.name).join(', ')});`,
          ],
          `}`,
          `return instance;`,
        ]).split('\n'),
        { name: 'deploy', kind: 'public' as const, args, returns: ['address'] },
      );

      // Functions - predict
      factory.setFunctionBody(
        [`return Clones.predictDeterministicAddress(address(implementation), _salt(${args.map(arg => arg.name).join(', ')}));`],
        { name: 'predict', kind: 'public' as const, args, returns: ['address'] },
        'view',
      );

      // Functions - _salt
      factory.setFunctionBody(
        [`return keccak256(abi.encode(${args.map(arg => arg.name).join(', ')}));`],
        { name: '_salt', kind: 'internal' as const, args, returns: ['bytes32'] },
        'pure',
      );
      break;
    }

    case 'uups': {
      // Import helpers
      factory.addImportOnly({
        name: 'ERC1967Proxy',
        path: '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol',
      });

      factory.addImportOnly({
        name: 'Create2',
        path: '@openzeppelin/contracts/utils/Create2.sol',
      });

      // Functions - create
      factory.setFunctionBody(
        formatLines([
          `bytes memory initcall = abi.encodeCall(${account.name}.initialize, (${account.constructorArgs.map(arg => arg.name).join(', ')}));`,
          'address instance = _predict(salt, initcall);',
          `if (instance.code.length == 0) {`,
          [
            `new ERC1967Proxy{salt: salt}(address(implementation), initcall);`,
          ],
          `}`,
          `return instance;`,
        ]).split('\n'),
        { name: 'deploy', kind: 'public' as const, args, returns: ['address'] },
      );

      // Functions - predict
      factory.setFunctionBody(
        [`return _predict(salt, abi.encodeCall(${account.name}.initialize, (${account.constructorArgs.map(arg => arg.name).join(', ')})));`],
        { name: 'predict', kind: 'public' as const, args, returns: ['address'] },
        'view',
      );

      // Functions - _salt
      factory.setFunctionBody(
        [ 'return Create2.computeAddress(salt, keccak256(bytes.concat(type(ERC1967Proxy).creationCode, abi.encode(implementation, initcall))));' ],
        {
          name: '_predict',
          kind: 'internal' as const,
          args: [{name: 'salt', type: 'bytes32'}, {name: 'initcall', type: 'bytes memory'}],
          returns: ['address'],
        },
        'view',
      );
      break;
    }

    defaults:
      throw new OptionsError({ factory: 'Factory requires the account to be transparent upgradeable' });
  }

  return factory;
}

const functions = defineFunctions({
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
});
