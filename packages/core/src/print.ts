import 'array.prototype.flatmap/auto';

import type { Contract, Parent, ContractFunction, FunctionArgument, Value, NatspecTag } from './contract';
import { Options, Helpers, withHelpers } from './options';

import { formatLines, spaceBetween, Lines } from './utils/format-lines';
import { mapValues } from './utils/map-values';

const SOLIDITY_VERSION = '0.8.2';

export function printContract(contract: Contract, opts?: Options): string {
  const helpers = withHelpers(contract, opts);

  const fns = mapValues(
    sortedFunctions(contract),
    fns => fns.map(fn => printFunction(fn, helpers)),
  );

  const hasOverrides = fns.override.some(l => l.length > 0);

  return formatLines(
    ...spaceBetween(
      [
        `// SPDX-License-Identifier: ${contract.license}`,
        `pragma solidity ^${SOLIDITY_VERSION};`,
      ],

      contract.imports.map(p => `import "${helpers.transformImport(p)}";`),

      [
        ...printNatspecTags(contract.natspecTags),
        [`contract ${contract.name}`, ...printInheritance(contract, helpers), '{'].join(' '),

        spaceBetween(
          printUsingFor(contract, helpers),
          contract.variables.map(helpers.transformVariable),
          printConstructor(contract, helpers),
          ...fns.code,
          ...fns.modifiers,
          hasOverrides ? [`// The following functions are overrides required by Solidity.`] : [],
          ...fns.override,
        ),

        `}`,
      ],
    ),
  );
}

function printInheritance(contract: Contract, { transformName }: Helpers): [] | [string] {
  if (contract.parents.length > 0) {
    return ['is ' + contract.parents.map(p => transformName(p.contract.name)).join(', ')];
  } else {
    return [];
  }
}

function printUsingFor(contract: Contract, { transformName }: Helpers): string[] {
  return contract.using.map(
    u => `using ${transformName(u.library.name)} for ${transformName(u.usingFor)};`,
  );
}

function printConstructor(contract: Contract, helpers: Helpers): Lines[] {
  const hasParentParams = contract.parents.some(p => p.params.length > 0);
  const hasConstructorCode = contract.constructorCode.length > 0;
  if (hasParentParams || hasConstructorCode) {
    const parents = contract.parents
      .filter(hasInitializer)
      .flatMap(p => printParentConstructor(p, helpers));
    const modifiers = helpers.upgradeable ? ['initializer public'] : parents;
    const args = contract.constructorArgs.map(a =>  printArgument(a, helpers));
    const body = helpers.upgradeable
      ? spaceBetween(
        parents.map(p => p + ';'),
        contract.constructorCode,
      )
      : contract.constructorCode;
    const head = helpers.upgradeable ? 'function initialize' : 'constructor';
    const constructor = printFunction2(
      head,
      args,
      modifiers,
      body,
    );
    if (!helpers.upgradeable) {
      return constructor;
    } else {
      return spaceBetween(
        [
          '/// @custom:oz-upgrades-unsafe-allow constructor',
          'constructor() initializer {}',
        ],
        constructor,
      );
    }
  } else {
    return [];
  }
}

function hasInitializer(parent: Parent) {
  // CAUTION
  // This list is validated by compilation of SafetyCheck.sol.
  // Always keep this list and that file in sync.
  return !['Initializable', 'ERC20Votes'].includes(parent.contract.name);
}

type SortedFunctions = Record<'code' | 'modifiers' | 'override', ContractFunction[]>;

// Functions with code first, then those with modifiers, then the rest
function sortedFunctions(contract: Contract): SortedFunctions {
  const fns: SortedFunctions = { code: [], modifiers: [], override: [] };

  for (const fn of contract.functions) {
    if (fn.code.length > 0) {
      fns.code.push(fn);
    } else if (fn.modifiers.length > 0) {
      fns.modifiers.push(fn);
    } else {
      fns.override.push(fn);
    }
  }

  return fns;
}

function printParentConstructor({ contract, params }: Parent, helpers: Helpers): [] | [string] {
  const fn = helpers.upgradeable ? `__${contract.name}_init` : contract.name;
  if (helpers.upgradeable || params.length > 0) {
    return [
      fn + '(' + params.map(printValue).join(', ') + ')',
    ];
  } else {
    return [];
  }
}

export function printValue(value: Value): string {
  if (typeof value === 'object' && 'ref' in value) {
    return value.ref;
  } else if (typeof value === 'number') {
    if (Number.isSafeInteger(value)) {
      return value.toFixed(0);
    } else {
      throw new Error(`Number not representable (${value})`);
    }
  } else {
    return JSON.stringify(value);
  }
}

function printFunction(fn: ContractFunction, helpers: Helpers): Lines[] {
  const { transformName } = helpers;

  if (fn.override.size <= 1 && fn.modifiers.length === 0 && fn.code.length === 0 && !fn.final) {
    return []
  }

  const modifiers: string[] = [fn.kind, ...fn.modifiers];

  if (fn.mutability !== 'nonpayable') {
    modifiers.splice(1, 0, fn.mutability);
  }

  if (fn.override.size === 1) {
    modifiers.push(`override`);
  } else if (fn.override.size > 1) {
    modifiers.push(`override(${[...fn.override].map(transformName).join(', ')})`);
  }

  if (fn.returns?.length) {
    modifiers.push(`returns (${fn.returns.join(', ')})`);
  }

  const code = [...fn.code];

  if (fn.override.size > 0 && !fn.final) {
    const superCall = `super.${fn.name}(${fn.args.map(a => a.name).join(', ')});`;
    code.push(fn.returns?.length ? 'return ' + superCall : superCall);
  }

  if (modifiers.length + fn.code.length > 1) {
    return printFunction2(
      'function ' + fn.name,
      fn.args.map(a => printArgument(a, helpers)),
      modifiers,
      code,
    );
  } else {
    return [];
  }
}

// generic for functions and constructors
// kindedName = 'function foo' or 'constructor'
function printFunction2(kindedName: string, args: string[], modifiers: string[], code: Lines[]): Lines[] {
  const fn = [];

  const headingLength = [kindedName, ...args, ...modifiers]
    .map(s => s.length)
    .reduce((a, b) => a + b);

  const braces = code.length > 0 ? '{' : '{}';

  if (headingLength <= 72) {
    fn.push([`${kindedName}(${args.join(', ')})`, ...modifiers, braces].join(' '));
  } else {
    fn.push(`${kindedName}(${args.join(', ')})`, modifiers, braces);
  }

  if (code.length > 0) {
    fn.push(code, '}');
  }

  return fn;
}

function printArgument(arg: FunctionArgument, { transformName }: Helpers): string {
  const type = /^[A-Z]/.test(arg.type) ? transformName(arg.type) : arg.type;
  return [type, arg.name].join(' ');
}

function printNatspecTags(tags: NatspecTag[]): string[] {
  return tags.map(({ key, value }) => `/// ${key}: ${value}`);
}