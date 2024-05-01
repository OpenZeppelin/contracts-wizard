import 'array.prototype.flatmap/auto';

import type { Contract, Component, Argument, Value, Impl, ContractFunction, } from './contract';

import { formatLines, spaceBetween, Lines } from './utils/format-lines';
import { getSelfArg } from './common-options';
import { compatibleContractsSemver } from './utils/version';

export function printContract(contract: Contract): string {
  return formatLines(
    ...spaceBetween(
      [
        `// SPDX-License-Identifier: ${contract.license}`,
        `// Compatible with OpenZeppelin Contracts for Cairo ${compatibleContractsSemver}`,
      ],
      printSuperVariables(contract),
      [
        `#[starknet::contract]`,
        `mod ${contract.name} {`,
        spaceBetween(
          printImports(contract),
          printComponentDeclarations(contract),
          printImpls(contract),
          printStorage(contract),
          printEvents(contract),
          printConstructor(contract),
          printImplementedTraits(contract),
        ),
        `}`,
      ],
    ),
  );
}

function withSemicolons(lines: string[]): string[] {
  return lines.map(line => line.endsWith(';') ? line : line + ';');
}

function printSuperVariables(contract: Contract) {
  return withSemicolons(contract.superVariables.map(v => `const ${v.name}: ${v.type} = ${v.value}`));
}

function printImports(contract: Contract) {
  const lines: string[] = [];
  sortImports(contract).forEach(i => lines.push(`use ${i}`));
  return withSemicolons(lines);
}

function sortImports(contract: Contract) {
  const componentImports = contract.components.flatMap(c => `${c.path}::${c.name}`);
  const allImports = componentImports.concat(contract.standaloneImports);
  if (contract.superVariables.length > 0) {
    allImports.push(`super::{${contract.superVariables.map(v => v.name).join(', ')}}`);
  }
  return allImports.sort();
}

function printComponentDeclarations(contract: Contract) {
  const lines = [];
  for (const component of contract.components) {
    lines.push(`component!(path: ${component.name}, storage: ${component.substorage.name}, event: ${component.event.name});`);
  }
  return lines;
}

function printImpls(contract: Contract) {
  const externalImpls = contract.components.flatMap(c => c.impls);
  const internalImpls = contract.components.flatMap(c => c.internalImpl ? [c.internalImpl] : []);

  return spaceBetween(
    externalImpls.flatMap(impl => printImpl(impl)),
    internalImpls.flatMap(impl => printImpl(impl, true))
  );
}

function printImpl(impl: Impl, internal = false) {
  const lines = [];
  if (!internal) {
    lines.push('#[abi(embed_v0)]');
  }
  lines.push(`impl ${impl.name} = ${impl.value};`);
  return lines;
}

function printStorage(contract: Contract) {
  const lines = [];
  // storage is required regardless of whether there are components
  lines.push('#[storage]');
  lines.push('struct Storage {');
  const storageLines = [];
  for (const component of contract.components) {
    storageLines.push(`#[substorage(v0)]`);
    storageLines.push(`${component.substorage.name}: ${component.substorage.type},`);
  }
  lines.push(storageLines);
  lines.push('}');
  return lines;
}

function printEvents(contract: Contract) {
  const lines = [];
  if (contract.components.length > 0) {
    lines.push('#[event]');
    lines.push('#[derive(Drop, starknet::Event)]');
    lines.push('enum Event {')
    const eventLines = [];
    for (const component of contract.components) {
      eventLines.push('#[flat]');
      eventLines.push(`${component.event.name}: ${component.event.type},`);
    }
    lines.push(eventLines);
    lines.push('}');
  }
  return lines;
}

function printImplementedTraits(contract: Contract) {
  const impls = [];

  // sort first by priority, then number of tags, then name
  const sortedTraits = contract.implementedTraits.sort((a, b) => {
    if (a.priority !== b.priority) {
      return (a.priority ?? Infinity) - (b.priority ?? Infinity);
    }
    if (a.tags.length !== b.tags.length) {
      return a.tags.length - b.tags.length;
    }
    return a.name.localeCompare(b.name);
  });

  for (const trait of sortedTraits) {
    const implLines = [];
    implLines.push(...trait.tags.map(t => `#[${t}]`));
    implLines.push(`impl ${trait.name} of ${trait.of} {`);
    const fns = trait.functions.map(fn => printFunction(fn));
    implLines.push(spaceBetween(...fns));
    implLines.push('}');
    impls.push(implLines);
  }
  return spaceBetween(...impls);
}

function printFunction(fn: ContractFunction) {
  const head = `fn ${fn.name}`;
  const args = fn.args.map(a => printArgument(a));

  const codeLines = fn.codeBefore?.concat(fn.code) ?? fn.code;
  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i];
    const shouldEndWithSemicolon = i < codeLines.length - 1 || fn.returns === undefined;
    if (line !== undefined && line.length > 0) {
      if (shouldEndWithSemicolon && !['{', '}', ';'].includes(line.charAt(line.length - 1))) {
        codeLines[i] += ';';
      } else if (!shouldEndWithSemicolon && line.endsWith(';')) {
        codeLines[i] = line.slice(0, line.length - 1);
      }
    }
  }

  return printFunction2(head, args, fn.tag, fn.returns, undefined, codeLines);
}

function printConstructor(contract: Contract): Lines[] {
  const hasParentParams = contract.components.some(p => p.initializer !== undefined && p.initializer.params.length > 0);
  const hasConstructorCode = contract.constructorCode.length > 0;
  if (hasParentParams || hasConstructorCode) {
    const parents = contract.components
      .filter(hasInitializer)
      .flatMap(p => printParentConstructor(p));
    const tag = 'constructor';
    const head = 'fn constructor';
    const args = [ getSelfArg(), ...contract.constructorArgs ];

    const body = spaceBetween(
        withSemicolons(parents),
        withSemicolons(contract.constructorCode),
      );

    const constructor = printFunction2(
      head,
      args.map(a => printArgument(a)),
      tag,
      undefined,
      undefined,
      body,
    );
    return constructor;
  } else {
    return [];
  }
}

function hasInitializer(parent: Component) {
  return parent.initializer !== undefined && parent.substorage?.name !== undefined;
}

function printParentConstructor({ substorage, initializer }: Component): [] | [string] {
  if (initializer === undefined || substorage?.name === undefined) {
    return [];
  }
  const fn = `self.${substorage.name}.initializer`;
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
    return `"${value}"`;
  }
}

// generic for functions and constructors
// kindedName = 'fn foo'
function printFunction2(kindedName: string, args: string[], tag: string | undefined, returns: string | undefined, returnLine: string | undefined, code: Lines[]): Lines[] {
  const fn = [];

  if (tag !== undefined) {
    fn.push(`#[${tag}]`);
  }

  let accum = `${kindedName}(`;

  if (args.length > 0) {
    let formattedArgs = args.join(', ');
    if (formattedArgs.length > 80) {
      fn.push(accum);
      accum = '';
      // print each arg in a separate line
      fn.push(args.map(arg => `${arg},`));
    } else {
      accum += `${formattedArgs}`;
    }
  }
  accum += ')';

  if (returns === undefined) {
    accum += ' {';
  } else {
    accum += ` -> ${returns} {`;
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
