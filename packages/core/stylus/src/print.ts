import type { Contract, Argument, ContractFunction, ImplementedTrait, UseClause } from './contract';
import { toIdentifier } from './utils/convert-strings';

import type { Lines } from './utils/format-lines';
import { formatLines, spaceBetween } from './utils/format-lines';
import { compatibleContractsSemver } from './utils/version';

const DEFAULT_SECTION = '1. with no section';
const STANDALONE_IMPORTS_GROUP = 'Standalone Imports';
const MAX_USE_CLAUSE_LINE_LENGTH = 90;
const TAB = '\t';

export function printContract(contract: Contract): string {
  const sortedGroups = sortImplsToGroups(contract);
  return formatLines(
    ...spaceBetween(
      [
        `// SPDX-License-Identifier: ${contract.license}`,
        `// Compatible with OpenZeppelin Contracts for Stylus ${compatibleContractsSemver}`,
      ],
      [`#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]`, `extern crate alloc;`],
      spaceBetween(
        [...printUseClauses(contract), 'use stylus_sdk::prelude::{entrypoint, public, storage};'],
        printConstants(contract),
        printStorage(contract.name.identifier, sortedGroups),
        contract.eip712Needed ? printEip712(contract.name.stringLiteral) : [],
        printImplementedTraits(contract.name.identifier, sortedGroups),
      ),
    ),
  );
}

function printUseClauses(contract: Contract): Lines[] {
  const useClauses = [...sortUseClauses(contract)];

  // group by containerPath
  const grouped = useClauses.reduce((result: { [containerPath: string]: UseClause[] }, useClause: UseClause) => {
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

function printConstants(contract: Contract): Lines[] {
  const lines = [];
  for (const constant of contract.constants) {
    // inlineComment is optional, default to false
    const inlineComment = constant.inlineComment ?? false;
    const commented = !!constant.comment;

    if (commented && !inlineComment) {
      lines.push(`// ${constant.comment}`);
      lines.push(`const ${constant.name}: ${constant.type} = ${constant.value};`);
    } else if (commented) {
      lines.push(`const ${constant.name}: ${constant.type} = ${constant.value}; // ${constant.comment}`);
    } else {
      lines.push(`const ${constant.name}: ${constant.type} = ${constant.value};`);
    }
  }
  return lines;
}

function getLinesFromUseClausesGroup(group: UseClause[], groupName: string): Lines[] {
  const lines = [];
  if (groupName === STANDALONE_IMPORTS_GROUP) {
    for (const useClause of group) {
      lines.push(`use ${useClause.containerPath}::${nameWithAlias(useClause)};`);
    }
  } else {
    if (group.length == 1) {
      lines.push(`use ${groupName}::${nameWithAlias(group[0]!)};`);
    } else if (group.length > 1) {
      const names = group.map(useClause => nameWithAlias(useClause)).join(', ');
      lines.push(`use ${groupName}::{${names}};`);
    }
  }
  return lines;
}

function nameWithAlias(useClause: UseClause): string {
  return useClause.alias ? `${useClause.name} as ${useClause.alias}` : useClause.name;
}

// TODO: remove this when we can use a formatting js library
function splitLongUseClauseLine(line: string): Lines[] {
  const lines = [];

  const containsBraces = line.indexOf('{') !== -1;
  if (containsBraces && line.length > MAX_USE_CLAUSE_LINE_LENGTH) {
    // split at the first brace
    lines.push(line.slice(0, line.indexOf('{') + 1));
    lines.push(...splitLongLineInner(line.slice(line.indexOf('{') + 1, -2)));
    lines.push('};');
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
    const aFullPath = `${a.containerPath}::${nameWithAlias(a)}`;
    const bFullPath = `${b.containerPath}::${nameWithAlias(b)}`;
    return aFullPath.localeCompare(bFullPath);
  });
}

/**
 * Sorts implemented traits by priority and name, and groups them by section.
 * @returns An array of tuples, where the first element is the section name and the second element is an array of implemented traits.
 */
function sortImplsToGroups(contract: Contract): [string, ImplementedTrait[]][] {
  const sortedTraits = contract.implementedTraits.sort((a, b) => {
    if (a.priority !== b.priority) {
      return (a.priority ?? Infinity) - (b.priority ?? Infinity);
    }
    return a.name.localeCompare(b.name);
  });

  // group by section
  const grouped = sortedTraits.reduce(
    (result: { [section: string]: ImplementedTrait[] }, current: ImplementedTrait) => {
      // default to no section
      const section = current.section ?? DEFAULT_SECTION;
      (result[section] = result[section] || []).push(current);
      return result;
    },
    {},
  );

  const sortedGroups = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  return sortedGroups;
}

function printStorage(contractName: string, sortedGroups: [string, ImplementedTrait[]][]): Lines[] {
  const structLines = sortedGroups
    .flatMap(([_, impls]) => impls)
    .flatMap(trait => trait.storage)
    .map(s => ['#[borrow]', `${s.name}: ${s.type},`]);

  const baseStruct = ['#[entrypoint]', '#[storage]'];

  return structLines.length === 0
    ? [...baseStruct, `struct ${contractName} {}`]
    : [...baseStruct, `struct ${contractName} {`, ...structLines, `}`];
}

function printEip712(contractName: string): Lines[] {
  return [
    '#[storage]',
    'struct Eip712 {}',
    '',
    'impl IEip712 for Eip712 {',
    spaceBetween([`const NAME: &'static str = "${contractName}";`, `const VERSION: &'static str = "1";`]),
    '}',
  ];
}

function printImplementedTraits(contractName: string, sortedGroups: [string, ImplementedTrait[]][]): Lines[] {
  const traitNames = sortedGroups
    .flatMap(([_, impls]) => impls)
    .filter(trait => !trait.omitInherit)
    .map(trait => trait.storage.type);

  const inheritAttribute = traitNames.length > 0 ? `#[inherit(${traitNames.join(', ')})]` : '#[inherit]';

  const header = ['#[public]', inheritAttribute];

  const sections = sortedGroups.map(([section, impls]) => printSectionFunctions(section, impls));

  return sections.length > 0 && sections.some(s => s.length > 0)
    ? [...header, `impl ${contractName} {`, spaceBetween(...sections), '}']
    : [...header, `impl ${contractName} {}`];
}

function printSectionFunctions(section: string, impls: ImplementedTrait[]): Lines[] {
  const functionBlocks = [];
  const isDefaultSection = section === DEFAULT_SECTION;
  if (!isDefaultSection) {
    functionBlocks.push(['//', `// ${section}`, '//']);
  }
  impls.forEach(trait => {
    trait.functions.forEach(fn => {
      functionBlocks.push(printFunction(fn));
    });
  });
  return spaceBetween(...functionBlocks);
}

function printFunction(fn: ContractFunction): Lines[] {
  const head = `fn ${fn.name}`;
  const args = fn.args.map(a => printArgument(a));

  const codeLines = (fn.codeBefore?.concat(fn.code) ?? fn.code).concat(fn.codeAfter ?? []);

  return printFunction2(fn.comments, head, args, fn.attribute, fn.returns, undefined, codeLines);
}

// generic for functions and constructors
// kindedName = 'fn foo'
function printFunction2(
  comments: string[] | undefined,
  kindedName: string,
  args: string[],
  attribute: string | undefined,
  returns: string | undefined,
  returnLine: string | undefined,
  code: Lines[],
): Lines[] {
  const fn = [];

  if (comments !== undefined) {
    fn.push(...comments);
  }

  if (attribute !== undefined) {
    fn.push(`#[${attribute}]`);
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

  if (code.length === 0) {
    accum += ' {}';
    fn.push(accum);
    return fn;
  }

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
