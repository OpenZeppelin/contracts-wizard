import 'array.prototype.flatmap/auto';

import type { Contract, Library, ContractFunction, Argument, Value, Module, } from './contract';
import { Options, Helpers, withHelpers } from './options';

import { formatLines, spaceBetween, Lines } from './utils/format-lines';
import { mapValues } from './utils/map-values';
import { getFunctionName } from './utils/module-prefix';

export function printContract(contract: Contract, opts?: Options): string {
  const helpers = withHelpers(contract, opts);

  const fns = mapValues(
    sortedFunctions(contract),
    fns => fns.map(fn => printFunction(fn, helpers)),
  );

  const hasViews = fns.views.some(l => l.length > 0);
  const hasExternals = fns.externals.some(l => l.length > 0);

	// map of functions to the module it was imported from
	const baseImports : Map<string, string> = new Map();
  for (const fn of contract.functions) {
    if (fn.module !== undefined) {
      // find the corresponding import
      for (const parent of contract.libraries) {
        if (parent.module === fn.module) {
          baseImports.set(getFunctionName(fn), convertPathToImport(parent.module.path));
          break;
        }
      }
    }
  }
  const importStatementObjs = toImportStatements(baseImports);

  const parentImportsMap: Map<string, string[]> = new Map();
  for (const parent of contract.libraries) {
    if (parent.functions !== undefined) {
      parentImportsMap.set(convertPathToImport(parent.module.path), parent.functions);
    }
  }
  // TODO this is temporary measure to merge maps since we have duplicates
  importStatementObjs.forEach((value, key) => {
    const parentValue = parentImportsMap.get(key);
    if (parentValue !== undefined) {
      parentImportsMap.set(key, Array.from(new Set(parentValue.concat(value))));
    }
  });

  const { starkwareImportsMap, ozImportsMap } = getVendoredImports(parentImportsMap);

  const starkwareImports = toImportLines(starkwareImportsMap); 
  const ozImports = toImportLines(ozImportsMap); 

  return formatLines(
    ...spaceBetween(
      [
        `# SPDX-License-Identifier: ${contract.license}`,
      ],
      
      [
        `# WARNING! This contains highly experimental code. Do not use in production.`
      ],
      
      [
        `%lang starknet`
      ],

      [
        `from starkware.cairo.common.cairo_builtins import HashBuiltin`,
        `from starkware.cairo.common.uint256 import Uint256`,
        ...starkwareImports,
      ],

      ozImports,

      spaceBetween(
        contract.variables.map(helpers.transformVariable),
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

function convertPathToImport(relativePath: any): string {
	return relativePath.split('/').join('.');
}

function toImportStatements(baseImports: Map<string, string>) {
  const importStatements: Map<string, string[]> = new Map();
  for (const [importName, moduleName] of baseImports.entries()) {
    const existingModuleFunctions = importStatements.get(moduleName);
    if (existingModuleFunctions === undefined) {
      importStatements.set(moduleName, [importName]);
    } else {
      existingModuleFunctions.push(importName);
    }
  }
  return importStatements;
}

function toImportLines(importStatements: Map<string, string[]>) {
  const lines = [];
  for (const [module, fns] of importStatements.entries()) {
    if (fns.length > 1) {
      lines.push(`from ${module} import (`);
      lines.push(fns.map(p => `${p},`));
      lines.push(`)`);
    } else if (fns.length === 1) {
      lines.push(`from ${module} import ${fns[0]}`);
    }
  }
  return lines;
}

function getVendoredImports(parentImportsMap: Map<string, string[]>) {
  const starkwareImportsMap: Map<string, string[]> = new Map<string, string[]>();
  const ozImportsMap: Map<string, string[]> = new Map<string, string[]>();
  for (let [key, value] of parentImportsMap) {
    if (key.startsWith('starkware')) {
      starkwareImportsMap.set(key, value);
    } else {
      ozImportsMap.set(key, value);
    }
  }
  return { starkwareImportsMap, ozImportsMap };
}

function printConstructor(contract: Contract, helpers: Helpers): Lines[] {
  const hasParentParams = contract.libraries.some(p => p.initializer !== undefined && p.initializer.params.length > 0);
  const hasConstructorCode = contract.constructorCode.length > 0;
  if (hasParentParams || hasConstructorCode) {
    const parents = contract.libraries
      .filter(hasInitializer)
      .flatMap(p => printParentConstructor(p, helpers));
    const modifiers = helpers.upgradeable ? ['external'] : ['constructor'];
    const head = helpers.upgradeable ? 'func initializer' : 'func constructor';
    const args = contract.constructorArgs.map(a => printArgument(a, helpers));
    const implicitArgs = contract.constructorImplicitArgs?.map(a => printArgument(a, helpers));
    const body = spaceBetween(
        parents,
        contract.constructorCode,
      );

    const constructor = printFunction2(
      head,
      implicitArgs ?? [],
      args,
      modifiers,
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
  const fn = `${contract.name}_initializer`;
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

function printFunction(fn: ContractFunction, helpers: Helpers): Lines[] {
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
    fn.implicitArgs?.map(a => printArgument(a, helpers)) ?? [],
    fn.args.map(a => printArgument(a, helpers)),
    [fn.kind ?? "kindNotFound"],
    fn.returns?.map(a => typeof a === 'string' ? a : printArgument(a, helpers)),
    returnVariables,
    code,
  );
}

// generic for functions and constructors
// kindedName = 'function foo' or 'constructor'
function printFunction2(kindedName: string, implicitArgs: string[], args: string[], kind: string[], returns: string[] | undefined, returnVariables: string[] | undefined, code: Lines[]): Lines[] {
  const fn = [];

  fn.push(`@${kind}`);
  fn.push(`${kindedName}{`);

  //fn.push([implicitArgs]);
  
  // TODO move this formatting out to printFunction()
  const implicitArgsFormatted: string[] = [];
  implicitArgs.forEach((implicitArg, index, arr) => 
  {
    if (index < arr.length - 1) {
      implicitArgsFormatted.push(`${implicitArg},`);
    } else {
      implicitArgsFormatted.push(`${implicitArg}`);
    }
  });
  fn.push([implicitArgsFormatted]);
  
  const formattedArgs = args.join(', ');
  const formattedReturns = returns?.join(', ');

  if (returns !== undefined) {
    fn.push([`}(${formattedArgs}) -> (${formattedReturns}):`]);
  } else {
    fn.push([`}(${formattedArgs}):`]);
  }

  // const headingLength = [kindedName, ...args, ...modifiers]
  //   .map(s => s.length)
  //   .reduce((a, b) => a + b);

  // if (headingLength <= 72) {
  //   fn.push([`(${args.join(', ')})`, ...modifiers, ':'].join(' '));
  // } else {
  //   fn.push(`(${args.join(', ')})`, modifiers, ':');
  // }

//  fn.push(`(${args.join(', ')})`, modifiers, ':');

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

function printArgument(arg: Argument, { transformName }: Helpers): string {
  if (arg.type !== undefined) {
    const type = /^[A-Z]/.test(arg.type) ? transformName(arg.type) : arg.type;
    return `${arg.name}: ${type}`;
  } else {
    return `${arg.name}`;
  }
}
