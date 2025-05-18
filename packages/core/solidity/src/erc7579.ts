import { ContractBuilder } from './contract';
import type { Contract } from './contract';
import { printContract } from './print';
import { defaults as commonDefaults, withCommonDefaults, type CommonOptions } from './common-options';
import { defineFunctions } from './utils/define-functions';
import { requireAccessControl, setAccessControl } from './set-access-control';

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
  overrideIsModuleType(c, allOpts);
  overrideValidation(c, allOpts);
  addInstallFns(c, allOpts);

  return c;
}

function overrideIsModuleType(c: ContractBuilder, opts: ERC7579Options): void {
  const fn = functions.isModuleType;

  if (opts.executor) {
    c.addOverride({ name: 'ERC7579Executor' }, fn);
  }

  if (opts.validator) {
    c.addOverride({ name: 'ERC7579Validator' }, fn);
  }

  if (opts.hook) {
    c.addOverride({ name: 'IERC7579Hook' }, fn);
  }

  if (opts.fallback) {
    c.addOverride({ name: 'IERC7579Module' }, fn);
  }

  const implementedIn = ['ERC7579Executor', 'ERC7579Validator'];
  const contractFn = c.functions.find(f => f.name === 'isModuleType')!;
  const allOverrides = Array.from(contractFn?.override.values() ?? []).map(v => v.name);
  const implementedOverrides = allOverrides.filter(type => implementedIn.includes(type));
  const unimplementedOverrides = allOverrides.filter(type => !implementedIn.includes(type));

  if (!implementedOverrides.length && !unimplementedOverrides.length) {
    c.setFunctionBody(['return false;'], fn);
  } else if (!implementedOverrides.length && unimplementedOverrides.length === 1) {
    const importedType = unimplementedOverrides[0]! === 'IERC7579Hook' ? 'MODULE_TYPE_HOOK' : 'MODULE_TYPE_FALLBACK';
    c.setFunctionBody([`return ${fn.args[0]!.name} == ${importedType};`], fn);
  } else if (implementedOverrides.length == 1 && !unimplementedOverrides.length) {
    c.setFunctionBody([`return ${implementedOverrides[0]!}.isModuleType(${fn.args[0]!.name})`], fn);
  } else {
    const body: string[] = [];
    for (const type of implementedOverrides) {
      body.push(`bool is${type} = ${type}.isModuleType(${fn.args[0]!.name})`);
    }
    for (const type of unimplementedOverrides) {
      const importedType = type === 'IERC7579Hook' ? 'MODULE_TYPE_HOOK' : 'MODULE_TYPE_FALLBACK';
      c.addImportOnly({
        name: importedType,
        path: '@openzeppelin/contracts/interfaces/draft-IERC7579.sol',
      });
      body.push(`bool is${type} = ${fn.args[0]!.name} == ${importedType};`);
    }
    body.push(`return ${allOverrides.map(type => `is${type}`).join(' || ')};`);
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
  if (opts.access) setAccessControl(c, opts.access);
  if (opts.executor) {
    const delayed = opts.executor.delayed; // Delayed ensures single execution per operation.
    const fn = delayed ? functions._validateSchedule : functions._validateExecution;
    c.addOverride(c, fn);
    c.setFunctionComments(
      ['/// @dev Data is encoded as `[uint16(executionCalldatalLength), executionCalldata, signature]`'],
      fn,
    );
    if (opts.validator) {
      c.addParent(
        {
          name: 'EIP712',
          path: '@openzeppelin/contracts/utils/cryptography/EIP712.sol',
        },
        [opts.name, '1'],
      );
      c.addVariable(
        `bytes32 public constant EXECUTION_TYPEHASH = "Execute(address account,bytes32 salt,${!delayed ? 'uint256 nonce,' : ''}bytes32 mode,bytes executionCalldata)"`,
      );
      const body = [
        `uint16 executionCalldataLength = uint16(uint256(bytes32(${fn.args[3]!.name}[0:2]))); // First 2 bytes are the length`,
        `bytes calldata executionCalldata = ${fn.args[3]!.name}[2:2 + executionCalldataLength]; // Next bytes are the calldata`,
        `bytes32 typeHash = _hashTypedDataV4(keccak256(abi.encode(EXECUTION_TYPEHASH, ${fn.args[0]!.name}, ${fn.args[1]!.name},${!delayed ? ` _useNonce(${fn.args[0]!.name}),` : ''} ${fn.args[2]!.name}, executionCalldata)));`,
      ];
      const conditions = [
        `_rawERC7579Validation(${fn.args[0]!.name}, typeHash, ${fn.args[3]!.name}[2 + executionCalldataLength:])`,
      ];
      switch (opts.access) {
        case 'ownable':
          conditions.unshift('msg.sender == owner()');
          break;
        case 'roles': {
          const roleOwner = 'executor';
          const roleId = 'EXECUTOR_ROLE';
          c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`);
          c.addConstructorArgument({ type: 'address', name: roleOwner });
          c.addConstructorCode(`_grantRole(${roleId}, ${roleOwner});`);
          conditions.unshift(`hasRole(${roleId}, msg.sender)`);
          break;
        }
        case 'managed':
          c.addImportOnly({
            name: 'AuthorityUtils',
            path: `@openzeppelin/contracts/access/manager/AuthorityUtils.sol`,
          });
          body.push(
            `(bool immediate, ) = AuthorityUtils.canCallWithDelay(authority(), msg.sender, address(this), bytes4(msg.data[0:4]));`,
          );
          conditions.unshift('immediate');
          break;
        default:
      }
      body.push(`require(${conditions.join(' || ')});`);
      if (!delayed) body.push(`return executionCalldata;`);
      c.setFunctionBody(body, fn);
    } else if (opts.access) {
      requireAccessControl(c, fn, opts.access, 'EXECUTOR', 'executor');
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
  if (opts.validator) {
    const isValidFn = functions.isValidSignatureWithSender;
    const fnSuper = `super.${isValidFn.name}(${isValidFn.args.map(a => a.name).join(', ')})`;
    c.addOverride(c, isValidFn);

    if (!opts.validator.multisig && opts.validator.signature) {
      c.setFunctionBody(['return false;'], functions._rawERC7579Validation);
    }

    switch (opts.access) {
      case 'ownable':
        c.setFunctionBody([`return owner() == ${isValidFn.args[0]!.name} || ${fnSuper};`], isValidFn);
        break;
      case 'roles': {
        const roleOwner = 'erc1271ValidSender';
        const roleId = 'ERC1271_VALID_SENDER_ROLE';
        c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`);
        c.addConstructorArgument({ type: 'address', name: roleOwner });
        c.addConstructorCode(`_grantRole(${roleId}, ${roleOwner});`);
        c.setFunctionBody([`return hasRole(${roleId}, ${isValidFn.args[0]!.name}) || ${fnSuper};`], isValidFn);
        break;
      }
      case 'managed':
        c.addImportOnly({
          name: 'AuthorityUtils',
          path: `@openzeppelin/contracts/access/manager/AuthorityUtils.sol`,
        });
        c.setFunctionBody(
          [
            `(bool immediate, ) = AuthorityUtils.canCallWithDelay(authority(), ${isValidFn.args[0]!.name}, address(this), bytes4(msg.data[0:4]));`,
            `return immediate || ${fnSuper};`,
          ],
          isValidFn,
        );
        break;
      default:
    }
  }
}

function addInstallFns(c: ContractBuilder, opts: ERC7579Options): void {
  if (opts.validator?.signature) {
    c.addOverride({ name: 'ERC7579Signature' }, functions.onInstall);
    c.addOverride({ name: 'ERC7579Signature' }, functions.onUninstall);
  }

  if (opts.validator?.multisig) {
    const name = opts.validator.multisig.weighted ? 'ERC7579MultisigWeighted' : 'ERC7579Multisig';
    c.addOverride({ name }, functions.onInstall);
    c.addOverride({ name }, functions.onUninstall);
  }

  if (opts.executor?.delayed) {
    c.addOverride({ name: 'ERC7579DelayedExecutor' }, functions.onInstall);
    c.addOverride({ name: 'ERC7579DelayedExecutor' }, functions.onUninstall);
  }

  const onInstallFn = c.functions.find(f => f.name === 'onInstall');
  const allOnInstallOverrides = Array.from(onInstallFn?.override.values() ?? []).map(c => c.name);
  buildOnInstallFn(c, allOnInstallOverrides);

  const onUninstallFn = c.functions.find(f => f.name === 'onUninstall');
  const allOnUninstallOverrides = Array.from(onUninstallFn?.override.values() ?? []).map(c => c.name);
  buildOnUninstallFn(c, allOnUninstallOverrides);
}

function buildOnInstallFn(c: ContractBuilder, overrides: string[]) {
  const fn = functions.onInstall;
  if (!overrides.length) {
    c.setFunctionBody(['// Use `data` to initialize'], fn);
  }
  // overrides.length == 1 will use super by default
  else if (overrides.length >= 2) {
    const body: string[] = [];
    let lengthOffset = '0';
    let comment = '/// @dev Data is encoded as `[';

    for (const [i, name] of overrides.entries()) {
      const argsName = `args${name}`;
      const lengthName = `${argsName}Length`;
      const argsOffset = !i ? '2' : `${lengthOffset} + 2`;
      const restOffset = `${argsOffset} + ${lengthName}`;
      comment += `uint16(${lengthName}), ${argsName}`;
      body.push(
        `uint16 ${lengthName} = uint16(uint256(bytes32(${fn.args[0]!.name}[${lengthOffset}:${argsOffset}]))); // First 2 bytes are the length`,
        `bytes calldata ${argsName} = ${fn.args[0]!.name}[${argsOffset}:${restOffset}]; // Next bytes are the args`,
        `${name}.onInstall(${argsName});`,
      );
      if (i != overrides.length - 1) {
        body.push('');
        comment += ', ';
      }
      lengthOffset = restOffset;
    }
    c.setFunctionComments([`${comment}]`], fn);
    c.setFunctionBody(body, fn);
  }
}

function buildOnUninstallFn(c: ContractBuilder, overrides: string[]) {
  const fn = functions.onUninstall;
  if (!overrides.length) {
    c.setFunctionBody(['// Use `data` to deinitialize'], fn);
  }
  // overrides.length == 1 will use super by default
  else if (overrides.length >= 2) {
    c.addImportOnly({ name: 'Calldata', path: '@openzeppelin/contracts/utils/Calldata.sol' });
    const body: string[] = [];
    for (const name of overrides) {
      body.push(`${name}.onUninstall(Calldata.emptyBytes());`);
    }
    c.setFunctionBody(body, fn);
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
    isValidSignatureWithSender: {
      kind: 'public' as const,
      mutability: 'view',
      args: [
        { name: 'sender', type: 'address' },
        { name: 'hash', type: 'bytes32' },
        { name: 'signature', type: 'bytes calldata' },
      ],
      returns: ['bytes4'],
    },
    _rawERC7579Validation: {
      kind: 'internal' as const,
      mutability: 'view',
      args: [
        { name: 'account', type: 'address' },
        { name: 'hash', type: 'bytes32' },
        { name: 'signature', type: 'bytes calldata' },
      ],
      returns: ['bool'],
    },
    isModuleType: {
      kind: 'public' as const,
      mutability: 'pure',
      args: [{ name: 'moduleTypeId', type: 'uint256' }],
      returns: ['bool'],
    },
    onInstall: {
      kind: 'public' as const,
      args: [{ name: 'data', type: 'bytes calldata' }],
    },
    onUninstall: {
      kind: 'public' as const,
      args: [{ name: 'data', type: 'bytes calldata' }],
    },
  }),
};
