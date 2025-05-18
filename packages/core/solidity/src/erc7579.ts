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

  addParents(c, allOpts);
  addMultisig(c, allOpts);

  return c;
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
    // NO OP
  }
}

function addMultisig(c: ContractBuilder, opts: ERC7579Options): void {
  if (opts.executor) {
    const fn = functions._validateExecution;
    c.addOverride(c, fn);
    if (opts.validator) {
      // _rawERC7579Validation available
      c.setFunctionBody(
        [
          `uint16 executionCalldataLength = uint16(uint256(bytes32(${fn.args[3]!.name}[0:2]))); // First 2 bytes are the length`,
          `bytes calldata executionCalldata = ${fn.args[3]!.name}[2:2 + executionCalldataLength]; // Next bytes are the calldata`,
          `bytes32 typeHash = _getExecuteTypeHash(${fn.args[0]!.name}, salt, mode, executionCalldata);`,
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
      args: [
        { name: 'account', type: 'address' },
        { name: 'hash', type: 'bytes32' },
        { name: 'mode', type: 'bytes32' },
        { name: 'data', type: 'bytes calldata' },
      ],
      returns: ['bytes calldata'],
    },
  }),
};
