import 'array.prototype.flatmap/auto';

import type { Contract, Library, ContractFunction, Argument, Value, } from './contract';
import { Helpers, withHelpers } from './options';

import { formatLines, spaceBetween, Lines } from './utils/format-lines';
import { getImportsMap } from './utils/imports-map';
import { mapValues } from './utils/map-values';
import { getFunctionName } from './utils/module-prefix';

export function printContract(contract: Contract): string {
  const helpers = withHelpers(contract);

  const fns = mapValues(
    sortedFunctions(contract),
    fns => fns.map(fn => printFunction(fn)),
  );

  const hasViews = fns.views.some(l => l.length > 0);
  const hasExternals = fns.externals.some(l => l.length > 0);

  const { starkwareImports, ozImports } = printImports(contract); 

  return formatLines(
    ...spaceBetween(
      [
        `// SPDX-License-Identifier: ${contract.license}`,
      ],
            
      [
        `%lang starknet`
      ],

      [
        ...starkwareImports,
      ],

      ozImports,

      spaceBetween(
        contract.variables,
        printConstructor(contract, helpers),
        ...fns.code,
        ...fns.modifiers,
        hasViews ? 
          [
            `//`,
            `// Getters`,
            `//`
          ] : [],
        ...fns.views,
        hasExternals ? 
        [
          `//`,
          `// Externals`,
          `//`
        ] : [],
      ...fns.externals,
      ),
    ),
  );
}

function withSemicolons(lines: string[]): string[] {
  return lines.map(line => line.endsWith(';') ? line : line + ';');
}

function printImports(contract: Contract) {
  const modulesToLibraryFunctions = getImportsMap(contract);
  const { starkwareImportsMap, ozImportsMap } = getVendoredImports(modulesToLibraryFunctions);

  const starkwareImports = printImportLines(starkwareImportsMap);
  const ozImports = printImportLines(ozImportsMap);
  return { starkwareImports, ozImports };
}

function getVendoredImports(parentImportsMap: Map<string, Set<string>>) {
  const starkwareImportsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
  const ozImportsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
  for (let [key, value] of parentImportsMap) {
    if (key.startsWith('starkware')) {
      starkwareImportsMap.set(key, value);
    } else {
      ozImportsMap.set(key, value);
    }
  }
  return { starkwareImportsMap, ozImportsMap };
}

function printImportLines(importStatements: Map<string, Set<string>>) {
  const lines = [];
  for (const [module, fns] of importStatements.entries()) {
    if (fns.size > 1) {
      lines.push(`from ${module} import (`);
      lines.push(Array.from(fns).map(p => `${p},`));
      lines.push(`)`);
    } else if (fns.size === 1) {
      lines.push(`from ${module} import ${Array.from(fns)[0]}`);
    }
  }
  return lines;
}

function printConstructor(contract: Contract, helpers: Helpers): Lines[] {
  const hasParentParams = contract.libraries.some(p => p.initializer !== undefined && p.initializer.params.length > 0);
  const hasConstructorCode = contract.constructorCode.length > 0;
  if (hasParentParams || hasConstructorCode) {
    const parents = contract.libraries
      .filter(hasInitializer)
      .flatMap(p => printParentConstructor(p));
    const modifier = helpers.upgradeable ? 'external' : 'constructor';
    const head = helpers.upgradeable ? 'func initializer' : 'func constructor';
    const args = contract.constructorArgs.map(a => printArgument(a));
    const implicitArgs = contract.constructorImplicitArgs?.map(a => printArgument(a));
    const body = spaceBetween(
        withSemicolons(parents),
        withSemicolons(contract.constructorCode),
      );

    const constructor = printFunction2(
      head,
      implicitArgs ?? [],
      args,
      modifier,
      undefined,
      'return ();',
      body,
    );
    return constructor;
  } else {
    return [];
  }
}

function hasInitializer(parent: Library) {
  return parent.initializer !== undefined && parent.module.name !== undefined;
}

type SortedFunctions = Record<'code' | 'modifiers' | 'views' | 'externals', ContractFunction[]>;

function sortedFunctions(contract: Contract): SortedFunctions {
  const fns: SortedFunctions = { code: [], modifiers: [], views: [], externals: [] };

  for (const fn of contract.functions) {
    if (fn.kind === undefined && fn.code.length > 0) { // fallback case, not sure if anything fits in this category
      fns.code.push(fn);
    } else if (fn.kind === 'view') {
      fns.views.push(fn);
    } else {
      fns.externals.push(fn);
    }
  }

  return fns;
}

function printParentConstructor({ module, initializer }: Library): [] | [string] {
  if (initializer === undefined || module.name === undefined || !module.useNamespace) {
    return [];
  }
  const fn = `${module.name}.initializer`;
  return [
    fn + '(' + initializer.params.map(printValue).join(', ') + ')',
  ];
}

export function printValue(value: Value): string {
  if (typeof value === 'object') {
    if ('lit' in value) {
      return value.lit;
    } else if ('note' in value) {
      return `${printValue(value.value)} /* ${value.note} */`;
    } else {
      throw Error('Unknown value type');
    }
  } else if (typeof value === 'number') {
    if (Number.isSafeInteger(value)) {
      return value.toFixed(0);
    } else {
      throw new Error(`Number not representable (${value})`);
    }
  } else {
    return `'${value}'`;
  }
}

function printFunction(fn: ContractFunction): Lines[] {
  const code = [];

  const returnArgs = fn.returns?.map(a => typeof a === 'string' ? a : a.name);

  fn.libraryCalls.forEach(libraryCall => {
    const libraryCallString = `${getFunctionName(libraryCall.callFn)}(${libraryCall.args.join(', ')})`;
    code.push(libraryCallString);
  });

  let returnLine = 'return ();';

  if (!fn.final && fn.module !== undefined) {
    const fnName = getFunctionName(fn);
    const parentFunctionCall = fn.read ? 
    `${fnName}.read()` :
    `${fnName}(${fn.args.map(a => a.name).join(', ')})`;
    if (!fn.passthrough || returnArgs === undefined || returnArgs.length === 0) {
      code.push(parentFunctionCall);
    } else if (fn.passthrough === 'strict') {
      code.push(`let (${returnArgs}) = ${parentFunctionCall}`);
      const namedReturnVars = returnArgs.map(v => `${v}=${v}`).join(', ');
      returnLine = `return (${namedReturnVars});`;
    } else if (fn.passthrough === true) {
      returnLine = `return ${parentFunctionCall};`;
    }
  }

  code.push(...fn.code);

  return printFunction2(
    'func ' + fn.name,
    fn.implicitArgs?.map(a => printArgument(a)) ?? [],
    fn.args.map(a => printArgument(a)),
    fn.kind,
    fn.returns?.map(a => typeof a === 'string' ? a : printArgument(a)),
    returnLine,
    withSemicolons(code),
  );
}

// generic for functions and constructors
// kindedName = 'func foo'
function printFunction2(kindedName: string, implicitArgs: string[], args: string[], kind: string | undefined, returns: string[] | undefined, returnLine: string, code: Lines[]): Lines[] {
  const fn = [];

  if (kind !== undefined) {
    fn.push(`@${kind}`);
  }

  let accum = kindedName;

  if (implicitArgs.length > 0) {
    accum += '{' + implicitArgs.join(', ') + '}';
  }
  
  if (args.length > 0) {
    fn.push(`${accum}(`);
    fn.push([args.join(', ')]);
    accum = ')';
  } else {
    accum += '()';
  }

  if (returns === undefined) {
    accum += ' {';
  } else {
    accum += ` -> (${returns.join(', ')}) {`;
  }

  fn.push(accum);
  
  fn.push(code);
  
  if (returnLine !== undefined) {
    fn.push([returnLine]);
  }

  fn.push('}');

  return fn;
}

function printArgument(arg: Argument): string {
  if (arg.type !== undefined) {
    const type = arg.type;
    return `${arg.name}: ${type}`;
  } else {
    return `${arg.name}`;
  }
}
