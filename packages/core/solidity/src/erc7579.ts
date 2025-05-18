import { ContractBuilder } from './contract';
import type { Contract } from './contract';
import { printContract } from './print';
import { defaults as commonDefaults, withCommonDefaults, type CommonOptions } from './common-options';
import { defineFunctions } from './utils/define-functions';

export const defaults: Required<ERC7579Options> = {
  ...commonDefaults,
  name: 'MyERC7579Module',
  validator: undefined,
  executor: undefined,
  hook: false,
  fallback: false,
  access: commonDefaults.access,
} as const;

export type ERC7579MultisigType = {
  weighted: boolean;
  confirmation: boolean;
};

export type ERC7579ValidatorType = {
  signature: boolean;
  multisig: ERC7579MultisigType;
};

export type ERC7579ExecutorType = {
  delayed: boolean;
};

export interface ERC7579Options extends CommonOptions {
  name: string;
  validator: ERC7579ValidatorType | undefined;
  executor: ERC7579ExecutorType | undefined;
  hook: boolean;
  fallback: boolean;
}

function withDefaults(opts: ERC7579Options): Required<ERC7579Options> {
  return {
    ...withCommonDefaults(opts),
    name: opts.name ?? defaults.name,
    validator: opts.validator ?? defaults.validator,
    executor: opts.executor ?? defaults.executor,
    hook: opts.hook ?? defaults.hook,
    fallback: opts.fallback ?? defaults.fallback,
  };
}

export function printERC7579(opts: ERC7579Options = defaults): string {
  return printContract(buildERC7579(opts));
}

export function buildERC7579(opts: ERC7579Options): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  // Base parent
  c.addOverride(
    {
      name: 'IERC7579Module',
    },
    functions.isModuleType,
  );

  overrideIsModuleType(c, allOpts);
  addParents(c, allOpts);
  overrideValidation(c, allOpts);
  // addAccess(c, allOpts); TODO
  // addOnInstall(c, allOpts); TODO

  return c;
}

type IsModuleTypeImplementation = 'ERC7579Executor' | 'ERC7579Validator' | 'IERC7579Hook' | 'Fallback';

function overrideIsModuleType(c: ContractBuilder, opts: ERC7579Options): void {
  const implementedIn: IsModuleTypeImplementation[] = ['ERC7579Executor', 'ERC7579Validator'] as const;
  const types: IsModuleTypeImplementation[] = [];
  const fn = functions.isModuleType;

  if (opts.executor) {
    types.push('ERC7579Executor');
    c.addOverride({ name: 'ERC7579Executor' }, fn);
  }

  if (opts.validator) {
    types.push('ERC7579Validator');
    c.addOverride({ name: 'ERC7579Validator' }, fn);
  }

  if (opts.hook) {
    types.push('IERC7579Hook');
    c.addOverride({ name: 'IERC7579Hook' }, fn);
  }

  if (opts.fallback) {
    types.push('Fallback');
  }

  const implementedOverrides = types.filter(type => implementedIn.includes(type));
  const unimplementedOverrides = types.filter(type => !implementedIn.includes(type));

  if (implementedOverrides.length === 0 && unimplementedOverrides.length === 1) {
    const importedType =
      unimplementedOverrides[0]! === 'IERC7579Hook' ? 'MODULE_TYPE_VALIDATOR' : 'MODULE_TYPE_FALLBACK';
    c.setFunctionBody([`return ${fn.args[0]!.name} == ${importedType};`], fn);
  } else if (
    implementedOverrides.length >= 2 || // 1 = n/a, 2 = defaults to super
    unimplementedOverrides.length > 0 // Require manual comparison
  ) {
    const body: string[] = [];
    for (const type of implementedOverrides) {
      body.push(`bool is${type} = ${type}.isModuleType(${fn.args[0]!.name})`);
    }
    for (const type of unimplementedOverrides) {
      const importedType = type === 'IERC7579Hook' ? 'MODULE_TYPE_VALIDATOR' : 'MODULE_TYPE_FALLBACK';
      c.addImportOnly({
        name: importedType,
        path: '@openzeppelin/contracts/interfaces/draft-IERC7579.sol',
      });
      body.push(`bool is${type} = ${fn.args[0]!.name} == ${importedType};`);
    }
    body.push(`return ${types.map(type => `is${type}`).join(' || ')};`);
    c.setFunctionBody(body, fn);
  }
}

function addParents(c: ContractBuilder, opts: ERC7579Options): void {
  c.addParent({
    name: 'IERC7579Module',
    path: '@openzeppelin/contracts/interfaces/draft-IERC7579.sol',
  });

  if (opts.executor) {
    c.addParent({
      name: 'ERC7579Executor',
      path: '@openzeppelin/community-contracts/account/modules/ERC7579Executor.sol',
    });

    if (opts.executor.delayed) {
      c.addParent({
        name: 'ERC7579DelayedExecutor',
        path: '@openzeppelin/community-contracts/account/modules/ERC7579DelayedExecutor.sol',
      });
    }
  }

  if (opts.validator) {
    c.addParent({
      name: 'ERC7579Validator',
      path: '@openzeppelin/community-contracts/account/modules/ERC7579Validator.sol',
    });

    if (opts.validator.signature) {
      c.addParent({
        name: 'ERC7579Signature',
        path: '@openzeppelin/community-contracts/account/modules/ERC7579Signature.sol',
      });
    }

    if (opts.validator.multisig) {
      c.addParent({
        name: 'ERC7579Multisig',
        path: '@openzeppelin/community-contracts/account/modules/ERC7579Multisig.sol',
      });

      if (opts.validator.multisig.weighted) {
        c.addParent({
          name: 'ERC7579MultisigWeighted',
          path: '@openzeppelin/community-contracts/account/modules/ERC7579MultisigWeighted.sol',
        });
      }

      if (opts.validator.multisig.confirmation) {
        c.addParent({
          name: 'ERC7579MultisigConfirmation',
          path: '@openzeppelin/community-contracts/account/modules/ERC7579MultisigConfirmation.sol',
        });
      }
    }
  }

  if (opts.hook) {
    c.addParent({
      name: 'IERC7579Hook',
      path: '@openzeppelin/contracts/interfaces/draft-IERC7579.sol',
    });
  }

  if (opts.fallback) {
    // noop
  }
}

function overrideValidation(c: ContractBuilder, opts: ERC7579Options): void {
  if (opts.executor) {
    const delayed = !opts.executor.delayed; // Delayed ensures single execution per operation.
    const fn = delayed ? functions._validateSchedule : functions._validateExecution;
    c.addOverride(c, fn);
    if (opts.validator) {
      c.addParent(
        {
          name: 'EIP712',
          path: '@openzeppelin/contracts/utils/cryptography/EIP712.sol',
        },
        [opts.name, '1'],
      );
      c.addVariable(
        `bytes32 public constant EXECUTION_TYPEHASH = "Execute(address account,bytes32 salt,${delayed ? 'uint256 nonce,' : ''}bytes32 mode,bytes executionCalldata)"`,
      );
      c.setFunctionBody(
        [
          `uint16 executionCalldataLength = uint16(uint256(bytes32(${fn.args[3]!.name}[0:2]))); // First 2 bytes are the length`,
          `bytes calldata executionCalldata = ${fn.args[3]!.name}[2:2 + executionCalldataLength]; // Next bytes are the calldata`,
          `bytes32 typeHash = _hashTypedDataV4(keccak256(abi.encode(EXECUTION_TYPEHASH, ${fn.args[0]!.name}, ${fn.args[1]!.name},${delayed ? ` _useNonce(${fn.args[0]!.name}),` : ''} ${fn.args[2]!.name}, executionCalldata)));`,
          `require(_rawERC7579Validation(${fn.args[0]!.name}, typeHash, ${fn.args[3]!.name}[2 + executionCalldataLength:])); // Remaining bytes are the signature`,
          `return executionCalldata;`,
        ],
        fn,
      );
    } else {
      c.setFunctionBody(
        [
          `// Slice \`${fn.args[3]!.name}\` to build custom authorization based on calldata`,
          `return ${fn.args[3]!.name}; // Use raw ${fn.args[3]!.name} as execution calldata`,
        ],
        fn,
      );
    }
  }
}

const functions = {
  ...defineFunctions({
    _validateExecution: {
      kind: 'internal' as const,
      mutability: 'view',
      args: [
        { name: 'account', type: 'address' },
        { name: 'salt', type: 'bytes32' },
        { name: 'mode', type: 'bytes32' },
        { name: 'data', type: 'bytes calldata' },
      ],
      returns: ['bytes calldata'],
    },
    _validateSchedule: {
      kind: 'internal' as const,
      mutability: 'view',
      args: [
        { name: 'account', type: 'address' },
        { name: 'salt', type: 'bytes32' },
        { name: 'mode', type: 'bytes32' },
        { name: 'data', type: 'bytes calldata' },
      ],
    },
    isModuleType: {
      kind: 'public' as const,
      mutability: 'pure',
      args: [{ name: 'moduleTypeId', type: 'uint256' }],
      returns: ['bool'],
    },
  }),
};
