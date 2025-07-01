import {
  type Contract,
  type Argument,
  type ContractFunction,
  type ContractTrait,
  type UseClause,
  type Result,
  type SolError,
  type TraitName,
  type ErrorList,
  isStoredContractTrait,
} from './contract';
import { copy } from './utils/copy';

import type { Lines } from './utils/format-lines';
import { formatLines, spaceBetween } from './utils/format-lines';
import { compatibleContractsSemver } from './utils/version';

const STANDALONE_IMPORTS_GROUP = 'Standalone Imports';
const MAX_USE_CLAUSE_LINE_LENGTH = 90;
const TAB = '\t';

type ErrorPrintItem = {
  module: string;
  errors: SolError[];
  wrapped: boolean;
};

type ErrorPrintData =
  | {
      type: 'inherited';
      commonType: string;
    }
  | {
      type: 'enum';
      commonType: 'Error';
      errors: ErrorPrintItem[];
    };

export function printContract(contract: Contract): string {
  const impls = sortImpls(contract);
  const errorData = extractErrors(contract);
  return formatLines(
    ...spaceBetween(
      [
        `// SPDX-License-Identifier: ${contract.license}`,
        `// Compatible with OpenZeppelin Contracts for Stylus ${compatibleContractsSemver}`,
        ...printDocumentations(contract.documentations),
        ...(contract.securityContact ? ['', ...printSecurityTag(contract.securityContact)] : []),
      ],
      [`#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]`, `extern crate alloc;`],
      spaceBetween(
        printUseClauses(contract),
        printConstants(contract),
        printErrors(errorData),
        printStorage(contract.name.identifier, impls),
        contract.eip712Needed ? printEip712(contract.name.stringLiteral) : [],
        printImplementsAttribute(contract, impls, errorData?.commonType),
        printImplementedTraits(contract.name.identifier, impls, errorData?.commonType),
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
  // because imports with `self` were prioritized in `sortUseClauses`,
  // we sort the lines again, but now by the final paths
  lines.sort();
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
    if (group.length === 0) {
      throw new Error(`Empty use clause group: ${groupName}`);
    } else if (group.length == 1) {
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
    // `self` should always take precedence
    if (a.name === 'self') return -1;
    if (b.name === 'self') return 1;

    const aFullPath = `${a.containerPath}::${nameWithAlias(a)}`;
    const bFullPath = `${b.containerPath}::${nameWithAlias(b)}`;
    return aFullPath.localeCompare(bFullPath);
  });
}

/**
 * Sorts implemented traits by priority and name, and groups them by section.
 * @returns An array of tuples, where the first element is the section name and the second element is an array of implemented traits.
 */
function sortImpls(contract: Contract): ContractTrait[] {
  const sortedTraits = contract.implementedTraits.sort((a, b) => {
    if (a.priority !== b.priority) {
      return (a.priority ?? Infinity) - (b.priority ?? Infinity);
    }
    return a.name.localeCompare(b.name);
  });

  return sortedTraits;
}

/**
 * Extract errors from the contract and determine the error type.
 * @returns ErrorData if errors exist, undefined otherwise. For single unwrapped errors,
 * returns inherited type. For multiple errors, returns enum type with grouped errors.
 */
function extractErrors(contract: Contract): ErrorPrintData | undefined {
  const { errorMap, wrappedTraitNames } = buildErrorMap(contract);
  markWrappedErrors(errorMap, wrappedTraitNames);

  const errors = Array.from(errorMap.values());
  const nonWrappedErrors = errors.filter(e => !e.wrapped);

  return nonWrappedErrors.length === 0
    ? undefined
    : nonWrappedErrors.length === 1
      ? { type: 'inherited', commonType: `${nonWrappedErrors[0]!.module}::Error` }
      : { type: 'enum', commonType: 'Error', errors };
}

function buildErrorMap(contract: Contract): {
  errorMap: Map<string, ErrorPrintItem>;
  wrappedTraitNames: TraitName[];
} {
  const wrappedTraitNames: TraitName[] = [];
  const errorMap = new Map<string, ErrorPrintItem>();

  for (const trait of contract.implementedTraits) {
    if (!('errors' in trait)) continue;

    const errors = copy(trait.errors);

    if ('wraps' in errors) {
      const wrappedErrName = errors.wraps;
      wrappedTraitNames.push(wrappedErrName);
      mergeWrappedErrors(errors, contract, wrappedErrName);
    }

    const module = trait.modulePath.split('::').pop()!;
    errorMap.set(trait.name, {
      module,
      errors: 'wraps' in errors ? errors.list : errors,
      wrapped: false,
    });
  }

  return { errorMap, wrappedTraitNames };
}

function mergeWrappedErrors(errors: ErrorList, contract: Contract, wrappedErrName: string): void {
  const wrappedErrTrait = contract.implementedTraits.find(t => t.name === wrappedErrName);
  if (!wrappedErrTrait || !('errors' in wrappedErrTrait)) {
    throw new Error(`Trait ${wrappedErrName} does not have errors`);
  }

  const wrappedErrErrors = wrappedErrTrait.errors;
  const errorsToMerge = 'list' in wrappedErrErrors ? wrappedErrErrors.list : wrappedErrErrors;

  if ('list' in errors) {
    errors.list.push(...errorsToMerge);
  } else {
    errors.push(...errorsToMerge);
  }
}

function markWrappedErrors(errorMap: Map<string, ErrorPrintItem>, wrappedTraitNames: TraitName[]): void {
  for (const traitName of wrappedTraitNames) {
    const errors = errorMap.get(traitName);
    if (errors) {
      errors.wrapped = true;
    }
  }
}

function printErrors(errorData?: ErrorPrintData): Lines[] {
  if (!errorData || errorData.type === 'inherited') {
    return [];
  }

  // collect all errors from non-wrapped traits, removing duplicates as some traits may wrap the same error
  const allErrors = errorData.errors
    .filter(e => !e.wrapped)
    .flatMap(e => e.errors)
    .reduce((acc, error) => {
      return acc.add(`${error.variant}(${error.value.module}::${error.value.error}),`);
    }, new Set<string>());

  const errorEnum: Lines[] = [
    '#[derive(SolidityError, Debug)]',
    'enum Error {',
    spaceBetween(Array.from(allErrors)),
    '}',
  ];

  const errorConversions = [];
  for (const { errors, module } of errorData.errors) {
    const errorConversionsForTrait = [
      `impl From<${module}::Error> for Error {`,
      spaceBetween([
        `fn from(error: ${module}::Error) -> Self {`,
        ['match value {'],
        [errors.map(error => printVariant(module, error))],
        ['}'],
        '}',
      ]),
      '}',
    ];
    errorConversions.push(errorConversionsForTrait);
  }

  return spaceBetween(errorEnum, ...errorConversions);
}

function printVariant(module: string, error: SolError): string {
  return `${module}::Error::${error.variant}(e) => Error::${error.variant}(e),`;
}

function printStorage(contractName: string, implementedTraits: ContractTrait[]): Lines[] {
  const structLines = implementedTraits.filter(isStoredContractTrait).map(({ storage: s }) => {
    const generics = s.genericType ? `<${s.genericType}>` : '';
    return [`${s.name}: ${s.type}${generics},`];
  });

  const baseStruct = ['#[entrypoint]', '#[storage]'];

  return structLines.length === 0
    ? [...baseStruct, `struct ${contractName};`]
    : [...baseStruct, `struct ${contractName} {`, ...structLines, `}`];
}

function printEip712(contractName: string): Lines[] {
  return [
    '#[storage]',
    'struct Eip712;',
    '',
    'impl IEip712 for Eip712 {',
    spaceBetween([`const NAME: &'static str = "${contractName}";`, `const VERSION: &'static str = "1";`]),
    '}',
  ];
}

function printImplementsAttribute(contract: Contract, implementedTraits: ContractTrait[], errorType?: string): Lines[] {
  const traitNames = implementedTraits.map(trait => {
    return trait.associatedError ? `${trait.name}<Error = ${errorType}>` : trait.name;
  });

  const header = ['#[public]'];
  if (traitNames.length > 0) {
    header.push(`#[implements(${traitNames.join(', ')})]`);
  }

  const fns = contract.functions.map(printFunction);

  return fns.length > 0
    ? [...header, `impl ${contract.name.identifier} {`, spaceBetween(...fns), '}']
    : [...header, `impl ${contract.name.identifier} {}`];
}

function printImplementedTraits(contractName: string, implementedTraits: ContractTrait[], errorType?: string): Lines[] {
  return spaceBetween(
    ...implementedTraits.map(trait => {
      const content = [];
      if (trait.associatedError) {
        content.push([`type Error = ${errorType};`]);
      }
      const fns = printTraitFunctions(trait);
      content.push(fns);

      return content.length > 0
        ? ['#[public]', `impl ${trait.name} for ${contractName} {`, [spaceBetween(...content)], '}']
        : ['#[public]', `impl ${trait.name} for ${contractName} {}`];
    }),
  ).flatMap(lines => lines);
}

function printTraitFunctions(impl: ContractTrait): Lines[] {
  const functionBlocks = impl.functions.map(fn => printFunction(fn));
  return spaceBetween(...functionBlocks);
}

function printFunction(fn: ContractFunction): Lines[] {
  const head = `fn ${fn.name}`;
  const args = fn.args.map(a => printArgument(a));

  const mainCode = !fn.returns
    ? fn.codeAfter?.length
      ? [`${fn.code};`].concat(fn.codeAfter)
      : [fn.code]
    : typeof fn.returns === 'string'
      ? // if there's code after, it's probably chained view function(s)
        [fn.code].concat(fn.codeAfter ?? [])
      : fn.codeAfter?.length
        ? [`${fn.code};`].concat(fn.codeAfter)
        : [`Ok(${fn.code})`];

  const codeLines = fn.codeBefore?.concat(mainCode) ?? mainCode;

  return printFunction2(fn.comments, head, args, fn.attribute, fn.returns, undefined, codeLines);
}

// generic for functions and constructors
// kindedName = 'fn foo'
function printFunction2(
  comments: string[] | undefined,
  kindedName: string,
  args: string[],
  attribute: string | undefined,
  returns: string | Result | undefined,
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
    if (typeof returns === 'string') {
      accum += ` -> ${returns} {`;
    } else {
      accum += ` -> Result<${returns.ok}, ${returns.err}> {`;
    }
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

function printDocumentations(documentations: string[]): string[] {
  return documentations.map(documentation => `//! ${documentation}`);
}

function printSecurityTag(securityContact: string) {
  return ['//! # Security', '//!', `//! For security issues, please contact: ${securityContact}`];
}
