import type { Contract, Argument, Value, Impl, ContractFunction, ImplementedTrait, UseClause, } from './contract';

import { formatLines, spaceBetween, Lines } from './utils/format-lines';
import { getSelfArg } from './common-options';
import { compatibleContractsSemver } from './utils/version';

const DEFAULT_SECTION = '1. with no section';
const STANDALONE_IMPORTS_GROUP = 'Standalone Imports';
const MAX_USE_CLAUSE_LINE_LENGTH = 90;
const TAB = "\t";

export function printContract(contract: Contract): string {
  return formatLines(
    ...spaceBetween(
      [
        `//! SPDX-License-Identifier: ${contract.license}`,
        `//! Compatible with OpenZeppelin Contracts for Stellar ${compatibleContractsSemver}`,
      ],
      spaceBetween(
        printUseClauses(contract),
        printVariables(contract),
        printContractStruct(contract),
        // printContractErrors(contract), // similar to printEvents
        printConstructor(contract),
        printImplementedTraits(contract),
      ),
    ),
  );
}

function printContractStruct(contract: Contract): Lines[] {
  return [
    '#[contract]',
    `pub struct ${contract.name};`
  ];
}

function withSemicolons(lines: string[]): string[] {
  return lines.map(line => line.endsWith(';') ? line : line + ';');
}

function printVariables(contract: Contract): string[] {
  return withSemicolons(contract.variables.map(v => `const ${v.name}: ${v.type} = ${v.value}`));
}

function printUseClauses(contract: Contract): Lines[] {
  const useClauses = sortUseClauses(contract);

  // group by containerPath
  const grouped = useClauses.reduce(
    (result: { [containerPath: string]: UseClause[] }, useClause: UseClause) => {
      if (useClause.groupable) {
        (result[useClause.containerPath] = result[useClause.containerPath] || []).push(useClause);
      } else {
        (result[STANDALONE_IMPORTS_GROUP] = result[STANDALONE_IMPORTS_GROUP] || []).push(useClause);
      }
      return result;
    }, {});

  const lines = Object.entries(grouped).flatMap(([groupName, group]) => getLinesFromUseClausesGroup(group, groupName));
  return lines.flatMap(line => splitLongUseClauseLine(line.toString()));
}

function getLinesFromUseClausesGroup(group: UseClause[], groupName: string): Lines[] {
  const lines = [];
  if (groupName === STANDALONE_IMPORTS_GROUP) {
    for (const useClause of group) {
      const alias = useClause.alias ?? '';
      if (alias.length > 0) {
        lines.push(`use ${useClause.containerPath}::${useClause.name} as ${alias};`);
      } else {
        lines.push(`use ${useClause.containerPath}::${useClause.name};`);
      }
    }
  } else {
    if (group.length == 1) {
      const alias = group[0]!.alias ?? '';
      if (alias.length > 0) {
        lines.push(`use ${groupName}::${group[0]!.name} as ${alias};`);
      } else {
        lines.push(`use ${groupName}::${group[0]!.name};`);
      }

    } else if (group.length > 1) {
      let clauses = group.reduce((clauses, useClause) => {
        const alias = useClause.alias ?? '';
        if (alias.length > 0) {
          clauses += `${useClause.name} as ${useClause.alias}, `;
        } else {
          clauses += `${useClause.name}, `;
        }
        return clauses;
      }, '');
      clauses = clauses.slice(0, -2);

      lines.push(`use ${groupName}::{${clauses}};`);
    }
  }
  return lines;
}

// TODO: remove this when we can use a formatting js library
function splitLongUseClauseLine(line: string): Lines[] {
  const lines = [];

  const containsBraces = line.indexOf('{') !== -1;
  if (containsBraces && line.length > MAX_USE_CLAUSE_LINE_LENGTH) {
    // split at the first brace
    lines.push(line.slice(0, line.indexOf('{') + 1));
    lines.push(...splitLongLineInner(line.slice(line.indexOf('{') + 1, -2)));
    lines.push("};");
  } else {
    lines.push(line);
  }
  return lines;
}

function splitLongLineInner(line: string): Lines[] {
  const lines = [];
  if (line.length > MAX_USE_CLAUSE_LINE_LENGTH) {
    const max_accessible_string = line.slice(0, MAX_USE_CLAUSE_LINE_LENGTH);
    const lastCommaIndex = max_accessible_string.lastIndexOf(',');
    if (lastCommaIndex !== -1) {
      lines.push(TAB + max_accessible_string.slice(0, lastCommaIndex + 1));
      lines.push(...splitLongLineInner(line.slice(lastCommaIndex + 2)));
    } else {
      lines.push(TAB + max_accessible_string);
    }
  } else {
    lines.push(TAB + line);
  }
  return lines;
}

function sortUseClauses(contract: Contract): UseClause[] {
  return contract.useClauses.sort((a, b) => {
    const aFullPath = `${a.containerPath}::${a.name}`;
    const bFullPath = `${b.containerPath}::${b.name}`;
    return aFullPath.localeCompare(bFullPath);
  });
}



// function printImpls(contract: Contract): Lines[] {
//   const impls = contract.components.flatMap(c => c.impls);

//   // group by section
//   const grouped = impls.reduce(
//     (result: { [section: string]: Impl[] }, current:Impl) => {
//       // default section depends on embed
//       // embed defaults to true
//       const embed = current.embed ?? true;
//       const section = current.section ?? (embed ? 'External' : 'Internal');
//       (result[section] = result[section] || []).push(current);
//       return result;
//     }, {});

//   const sections = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0])).map(
//     ([section, impls]) => printSection(section, impls as Impl[]),
//   );
//   return spaceBetween(...sections);
// }

// function printSection(section: string, impls: Impl[]): Lines[] {
//   const lines = [];
//   lines.push(`// ${section}`);
//   impls.map(impl => lines.push(...printImpl(impl)));
//   return lines;
// }

// function printImpl(impl: Impl): Lines[] {
//   const lines = [];
//   // embed is optional, default to true
//   if (impl.embed ?? true) {
//     lines.push('#[abi(embed_v0)]');
//   }
//   lines.push(`impl ${impl.name} = ${impl.value};`);
//   return lines;
// }

// function printStorage(contract: Contract): (string | string[])[] {
//   const lines = [];
//   // storage is required regardless of whether there are components
//   lines.push('#[storage]');
//   lines.push('struct Storage {');
//   const storageLines = [];
//   for (const component of contract.components) {
//     storageLines.push(`#[substorage(v0)]`);
//     storageLines.push(`${component.substorage.name}: ${component.substorage.type},`);
//   }
//   lines.push(storageLines);
//   lines.push('}');
//   return lines;
// }

// function printEvents(contract: Contract): (string | string[])[] {
//   const lines = [];
//   if (contract.components.length > 0) {
//     lines.push('#[event]');
//     lines.push('#[derive(Drop, starknet::Event)]');
//     lines.push('enum Event {')
//     const eventLines = [];
//     for (const component of contract.components) {
//       eventLines.push('#[flat]');
//       eventLines.push(`${component.event.name}: ${component.event.type},`);
//     }
//     lines.push(eventLines);
//     lines.push('}');
//   }
//   return lines;
// }

function printImplementedTraits(contract: Contract): Lines[] {
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

  // group by section
  const grouped = sortedTraits.reduce(
    (result: { [section: string]: ImplementedTrait[] }, current:ImplementedTrait) => {
      // default to no section
      const section = current.section ?? DEFAULT_SECTION;
      (result[section] = result[section] || []).push(current);
      return result;
    }, {});

  const sections = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0])).map(
    ([section, impls]) => printImplementedTraitsSection(section, impls as ImplementedTrait[]),
  );

  return spaceBetween(...sections);
}

function printImplementedTraitsSection(section: string, impls: ImplementedTrait[]): Lines[] {
  const lines = [];
  const isDefaultSection = section === DEFAULT_SECTION;
  if (!isDefaultSection) {
    lines.push('//');
    lines.push(`// ${section}`);
    lines.push('//');
  }
  impls.forEach((trait, index) => {
    if (index > 0 || !isDefaultSection) {
      lines.push('');
    }
    lines.push(...printImplementedTrait(trait));
  });
  return lines;
}

function printImplementedTrait(trait: ImplementedTrait): Lines[] {
  const implLines = [];
  implLines.push(...trait.tags.map(t => `#[${t}]`));
  implLines.push(`impl ${trait.name} for ${trait.for} {`);

  const superVars = withSemicolons(
    trait.superVariables.map(v => `const ${v.name}: ${v.type} = ${v.value}`)
  );
  implLines.push(superVars);

  const fns = trait.functions.map(fn => printFunction(fn));
  implLines.push(spaceBetween(...fns));
  implLines.push('}');
  return implLines;
}

function printFunction(fn: ContractFunction): Lines[] {
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
  // const hasInitializers = contract.components.some(p => p.initializer !== undefined);
  if (contract.constructorCode.length > 0) {
    const tag = 'TODO constructor';
    const head = 'pub fn __constructor';
    const args = [ getSelfArg(), ...contract.constructorArgs ];

    const body = spaceBetween(
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

export function printValue(value: Value): string {
  if (typeof value === 'object') {
    if ('lit' in value) {
      return value.lit;
    } else if ('note' in value) {
      // TODO: add /* ${value.note} */ after lsp is fixed
      return `${printValue(value.value)}`;
    } else {
      throw Error('Unknown value type');
    }
  } else if (typeof value === 'number') {
    if (Number.isSafeInteger(value)) {
      return value.toFixed(0);
    } else {
      throw new Error(`Number not representable (${value})`);
    }
  } else if (typeof value === 'bigint') {
    return `${value}`
  } else {
    return `"${value}"`;
  }
}

// generic for functions and constructors
// kindedName = 'fn foo'
function printFunction2(
  kindedName: string,
  args: string[],
  tag: string | undefined,
  returns: string | undefined,
  returnLine: string | undefined,
  code: Lines[]
): Lines[] {
  const fn = [];

  if (tag !== undefined) {
    fn.push(`#[${tag}]`);
  }

  let accum = `${kindedName}(`;

  if (args.length > 0) {
    const formattedArgs = args.join(', ');
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
