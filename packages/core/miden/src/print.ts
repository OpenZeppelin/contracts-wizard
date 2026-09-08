import type { Argument, Constant, Contract, ContractFunction, UseClause } from './contract';
import type { Lines } from './utils/format-lines';
import { formatLines, spaceBetween } from './utils/format-lines';
import { compatibleContractsSemver } from './utils/version';

/** Maximum line width used by `rustfmt` with its default configuration. */
const MAX_LINE_WIDTH = 100;
const INDENT = '    ';

export function printContract(contract: Contract): string {
  return formatLines(
    ...spaceBetween(
      [
        `// SPDX-License-Identifier: ${contract.license}`,
        `// Compatible with Miden Protocol ${compatibleContractsSemver}`,
      ],
      ...printUseClauses(contract),
      [...printStructDocumentation(contract), `pub struct ${contract.name.identifier};`],
      printImplBlock(contract),
    ),
  );
}

function printStructDocumentation(contract: Contract): string[] {
  const lines = contract.documentations.map(docLine);
  if (contract.securityContact) {
    lines.push(
      ...['', '# Security', '', `For security issues, please contact: ${contract.securityContact}`].map(docLine),
    );
  }
  return lines;
}

function docLine(line: string): string {
  return line.length === 0 ? '///' : `/// ${line}`;
}

/**
 * Prints the `use` declarations grouped by module path, with the standard library group first,
 * following the default `rustfmt` style.
 */
function printUseClauses(contract: Contract): Lines[][] {
  const groups = new Map<string, UseClause[]>();
  for (const useClause of contract.useClauses) {
    const group = groups.get(useClause.containerPath) ?? [];
    group.push(useClause);
    groups.set(useClause.containerPath, group);
  }

  const items = [...groups.entries()].map(([containerPath, group]) => {
    const names = group.map(nameWithAlias).sort(compareNames);
    return { containerPath, names, segments: useItemSegments(containerPath, names) };
  });
  items.sort((a, b) => compareSegments(a.segments, b.segments));

  const std: string[] = [];
  const external: string[] = [];
  for (const { containerPath, names } of items) {
    const target = isStdPath(containerPath) ? std : external;
    target.push(...printUseClauseGroup(containerPath, names));
  }

  return [std, external];
}

function nameWithAlias(useClause: UseClause): string {
  return useClause.alias ? `${useClause.name} as ${useClause.alias}` : useClause.name;
}

function isStdPath(containerPath: string): boolean {
  const root = containerPath.split('::')[0];
  return root === 'std' || root === 'core' || root === 'alloc';
}

/** Marker segment standing for a `{...}` list, which `rustfmt` sorts after any identifier. */
const LIST_SEGMENT = '{';

function useItemSegments(containerPath: string, names: string[]): string[] {
  const [single] = names;
  return [...containerPath.split('::'), names.length === 1 && single !== undefined ? single : LIST_SEGMENT];
}

/**
 * Compares two `use` paths segment by segment like `rustfmt` does: `self` first, then identifiers in ASCII
 * order (uppercase before lowercase), with `{...}` lists sorting last.
 */
function compareSegments(a: string[], b: string[]): number {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const [x, y] = [a[i]!, b[i]!];
    if (x === y) continue;
    if (x === LIST_SEGMENT) return 1;
    if (y === LIST_SEGMENT) return -1;
    return compareNames(x, y);
  }
  return a.length - b.length;
}

function compareNames(a: string, b: string): number {
  if (a === 'self') return -1;
  if (b === 'self') return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** `rustfmt` breaks single-line `use` lists that are longer than this. */
const MAX_USE_LINE_WIDTH = 98;

function printUseClauseGroup(containerPath: string, names: string[]): string[] {
  if (names.length === 1) {
    return [`use ${containerPath}::${names[0]};`];
  }

  const singleLine = `use ${containerPath}::{${names.join(', ')}};`;
  if (singleLine.length <= MAX_USE_LINE_WIDTH) {
    return [singleLine];
  }

  // Mixed layout: fill each line with as many names as fit. `rustfmt` gives the block-indented list one column less
  // than the line width, and does not count the trailing comma of the last name when checking whether it fits.
  const lines = [`use ${containerPath}::{`];
  let current = '';
  for (const [i, name] of names.entries()) {
    const item = `${name},`;
    const trailingComma = i === names.length - 1 ? 1 : 0;
    const width = INDENT.length + current.length + 1 + item.length - trailingComma;
    if (current.length > 0 && width > MAX_LINE_WIDTH - 1) {
      lines.push(INDENT + current);
      current = item;
    } else {
      current = current.length === 0 ? item : `${current} ${item}`;
    }
  }
  if (current.length > 0) {
    lines.push(INDENT + current);
  }
  lines.push('};');
  return lines;
}

function printImplBlock(contract: Contract): Lines[] {
  const items: Lines[][] = [...contract.constants.map(printConstant), ...contract.functions.map(printFunction)];

  return [`impl ${contract.name.identifier} {`, spaceBetween(...items), '}'];
}

function printConstant(constant: Constant): Lines[] {
  return [...constant.comments.map(docLine), `pub const ${constant.name}: ${constant.type} = ${constant.value};`];
}

function printFunction(fn: ContractFunction): Lines[] {
  const lines: Lines[] = [...fn.comments.map(docLine)];

  const visibility = fn.pub ? 'pub ' : '';
  const returns = fn.returns ? ` -> ${fn.returns}` : '';
  const args = fn.args.map(printArgument);
  const singleLine = `${visibility}fn ${fn.name}(${args.join(', ')})${returns} {`;

  if (INDENT.length + singleLine.length <= MAX_LINE_WIDTH) {
    lines.push(singleLine);
  } else {
    lines.push(`${visibility}fn ${fn.name}(`);
    lines.push(args.map(arg => `${arg},`));
    lines.push(`)${returns} {`);
  }

  lines.push(fn.code);
  lines.push('}');
  return lines;
}

function printArgument(arg: Argument): string {
  return `${arg.name}: ${arg.type}`;
}
