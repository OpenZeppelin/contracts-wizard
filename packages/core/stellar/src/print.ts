import type { Contract, Argument, ContractFunction, TraitImplBlock, UseClause } from './contract';

import type { Lines } from './utils/format-lines';
import { formatLines, spaceBetween } from './utils/format-lines';
import { getSelfArg } from './common-options';
import { compatibleContractsSemver } from './utils/version';

const DEFAULT_SECTION = '1. with no section';
const STANDALONE_IMPORTS_GROUP = 'Standalone Imports';
const MAX_USE_CLAUSE_LINE_LENGTH = 90;
const TAB = '    ';

export function printContract(contract: Contract): string {
  return formatLines(
    ...spaceBetween(
      [
        `// SPDX-License-Identifier: ${contract.license}`,
        `// Compatible with OpenZeppelin Stellar Soroban Contracts ${compatibleContractsSemver}`,
        `#![no_std]`,
      ],
      spaceBetween(
        printUseClauses(contract),
        printVariables(contract),
        printContractStruct(contract),
        printContractErrors(contract),
        printContractFunctions(contract),
        printImplementedTraits(contract),
      ),
    ),
  );
}

function printContractStruct(contract: Contract): Lines[] {
  return ['#[contract]', `pub struct ${contract.name};`];
}

function printContractErrors(contract: Contract): Lines[] {
  if (contract.errors.length === 0) {
    return [];
  }
  return [
    '#[contracterror]',
    '#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]',
    '#[repr(u32)]',
    `pub enum ${contract.name}Error {`,
    contract.errors.map(e => `${e.name} = ${e.num},`),
    `}`,
  ];
}

function withSemicolons(lines: string[]): string[] {
  return lines.map(line => (line.endsWith(';') ? line : line + ';'));
}

function printVariables(contract: Contract): string[] {
  return withSemicolons(contract.variables.map(v => `const ${v.name}: ${v.type} = ${v.value}`));
}

function printUseClauses(contract: Contract): Lines[] {
  const useClauses = sortUseClauses(contract);

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
    if (a.containerPath === b.containerPath) {
      if (a.name === 'self' && b.name !== 'self') {
        return -1;
      } else if (a.name !== 'self' && b.name === 'self') {
        return 1;
      }
      return nameWithAlias(a).localeCompare(nameWithAlias(b));
    } else {
      return a.containerPath.localeCompare(b.containerPath);
    }
  });
}

function printImplementedTraits(contract: Contract): Lines[] {
  // sort first by priority, then number of tags, then name
  const sortedTraits = contract.implementedTraits.sort((a, b) => {
    if (a.priority !== b.priority) {
      return (a.priority ?? Infinity) - (b.priority ?? Infinity);
    }
    if (a.tags.length !== b.tags.length) {
      return a.tags.length - b.tags.length;
    }
    return a.traitName.localeCompare(b.traitName);
  });

  // group by section
  const grouped = sortedTraits.reduce((result: { [section: string]: TraitImplBlock[] }, current: TraitImplBlock) => {
    // default to no section
    const section = current.section ?? DEFAULT_SECTION;
    (result[section] = result[section] || []).push(current);
    return result;
  }, {});

  const sections = Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([section, impls]) => printImplementedTraitsSection(section, impls as TraitImplBlock[]));

  return spaceBetween(...sections);
}

function printImplementedTraitsSection(section: string, impls: TraitImplBlock[]): Lines[] {
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

function printImplementedTrait(trait: TraitImplBlock): Lines[] {
  const implLines = [];
  implLines.push(...trait.tags.map(t => `#[${t}]`));
  implLines.push(`impl ${trait.traitName} for ${trait.structName} {`);
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

function printContractFunctions(contract: Contract): Lines[] {
  const constructorLines = printConstructor(contract);
  const freeFunctionLines = contract.freeFunctions.map(fn => printFunction(fn));

  if (constructorLines.length === 0 && freeFunctionLines.length === 0) {
    return [];
  }

  const implBlock: Lines[] = ['#[contractimpl]', `impl ${contract.name} {`];

  if (constructorLines.length > 0) {
    implBlock.push(constructorLines);
  }

  if (constructorLines.length > 0 && freeFunctionLines.length > 0) {
    // Add line break between constructor and first free function
    implBlock.push('');
  }

  if (freeFunctionLines.length > 0) {
    implBlock.push(spaceBetween(...freeFunctionLines));
  }

  implBlock.push('}');
  return implBlock;
}

function printConstructor(contract: Contract): Lines[] {
  if (contract.constructorCode.length > 0) {
    const head = 'pub fn __constructor';
    const args = [getSelfArg(), ...contract.constructorArgs];

    const body = spaceBetween(withSemicolons(contract.constructorCode));

    const constructor = printFunction2(
      head,
      args.map(a => printArgument(a)),
      undefined,
      undefined,
      undefined,
      body,
    );
    return constructor;
  } else {
    return [];
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
  code: Lines[],
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
