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
        `# SPDX-License-Identifier: ${contract.license}`,
      ],
            
      [
        `%lang starknet`
      ],

      [
        ...starkwareImports,
      ],

      ozImports,

      spaceBetween(
        printConstructor(contract, helpers),
        ...fns.code,
        ...fns.modifiers,
        hasViews ? 
          [
            `#`,
            `# Getters`,
            `#`
          ] : [],
        ...fns.views,
        hasExternals ? 
        [
          `#`,
          `# Externals`,
          `#`
        ] : [],
      ...fns.externals,
      ),
    ),
  );
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
      .flatMap(p => printParentConstructor(p, helpers));
    const modifier = helpers.upgradeable ? 'external' : 'constructor';
    const head = helpers.upgradeable ? 'func initializer' : 'func constructor';
    const args = contract.constructorArgs.map(a => printArgument(a));
    const implicitArgs = contract.constructorImplicitArgs?.map(a => printArgument(a));
    const body = spaceBetween(
        parents,
        contract.constructorCode,
      );

    const constructor = printFunction2(
      head,
      implicitArgs ?? [],
      args,
      modifier,
      undefined,
      undefined,
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

function printParentConstructor({ module: contract, initializer }: Library, helpers: Helpers): [] | [string] {
  if (initializer === undefined || contract.name === undefined) {
    return [];
  }
  const fn = initializer.namespace !== undefined ? `${contract.name}.initializer` : `${contract.name}_initializer`;
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

  fn.libraryCalls.forEach(callFn => {
    const libraryCall = `${getFunctionName(callFn)}()`;
    code.push(libraryCall);
  });

  if (!fn.final && fn.module !== undefined) {
    const fnName = getFunctionName(fn);
    const parentFunctionCall = fn.read ? 
    `${fnName}.read()` :
    `${fnName}(${fn.args.map(a => a.name).join(', ')})`;
    const callParentLine = fn.passthrough ? `let (${returnArgs}) = ${parentFunctionCall}` : `${parentFunctionCall}`;
    code.push(callParentLine);
  }

  code.push(...fn.code);

  const returnVariables = fn.returnValue ? [fn.returnValue] : returnArgs;

  return printFunction2(
    'func ' + fn.name,
    fn.implicitArgs?.map(a => printArgument(a)) ?? [],
    fn.args.map(a => printArgument(a)),
    fn.kind,
    fn.returns?.map(a => typeof a === 'string' ? a : printArgument(a)),
    returnVariables,
    code,
  );
}

// generic for functions and constructors
// kindedName = 'func foo'
function printFunction2(kindedName: string, implicitArgs: string[], args: string[], kind: string | undefined, returns: string[] | undefined, returnVariables: string[] | undefined, code: Lines[]): Lines[] {
  const fn = [];

  if (kind !== undefined) {
    fn.push(`@${kind}`);
  }
  fn.push(`${kindedName}{`);
  
  const implicitArgsFormatted = formatImplicitArgs(implicitArgs);
  fn.push([implicitArgsFormatted]);
  
  const formattedArgs = args.join(', ');
  const formattedReturns = returns?.join(', ');

  if (returns !== undefined) {
    fn.push([`}(${formattedArgs}) -> (${formattedReturns}):`]);
  } else {
    fn.push([`}(${formattedArgs}):`]);
  }

  fn.push(code);

  if (returnVariables !== undefined) {
    const formattedReturnVars = returnVariables?.join(', ');
    fn.push([`return (${formattedReturnVars})`]);
  } else {
    fn.push(['return ()']);
  }

  fn.push('end');

  return fn;
}

function formatImplicitArgs(implicitArgs: string[]) {
  const implicitArgsFormatted: string[] = [];
  implicitArgs.forEach((implicitArg, index, arr) => {
    if (index < arr.length - 1) {
      implicitArgsFormatted.push(`${implicitArg},`);
    } else {
      implicitArgsFormatted.push(`${implicitArg}`);
    }
  });
  return implicitArgsFormatted;
}

function printArgument(arg: Argument): string {
  if (arg.type !== undefined) {
    const type = arg.type;
    return `${arg.name}: ${type}`;
  } else {
    return `${arg.name}`;
  }
}
