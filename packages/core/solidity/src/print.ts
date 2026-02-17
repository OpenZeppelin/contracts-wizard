import type {
  Contract,
  Parent,
  ContractFunction,
  FunctionArgument,
  Value,
  NatspecTag,
  ImportContract,
  ContractStruct,
  VariableOrErrorDefinition,
} from './contract';
import type { Options, Helpers } from './options';
import { withHelpers } from './options';

import type { Lines } from './utils/format-lines';
import { formatLines, spaceBetween } from './utils/format-lines';
import { mapValues } from './utils/map-values';
import SOLIDITY_VERSION from './solidity-version.json';
import { inferTranspiled } from './infer-transpiled';
import { compatibleContractsSemver } from './utils/version';
import { stringifyUnicodeSafe } from './utils/sanitize';
import { importsLibrary } from './utils/imports-libraries';
import { getCommunityContractsGitCommit } from './utils/community-contracts-git-commit';

export function printContract(contract: Contract, opts?: Options): string {
  const helpers = withHelpers(contract, opts);

  const structs = contract.structs.map(_struct => printStruct(_struct));
  const fns = mapValues(sortedFunctions(contract), fns => fns.map(fn => printFunction(fn, helpers)));
  const hasOverrides = fns.override.some(l => l.length > 0);
  return formatLines(
    ...spaceBetween(
      [
        `// SPDX-License-Identifier: ${contract.license}`,
        printCompatibleLibraryVersions(contract, opts),
        `pragma solidity ^${SOLIDITY_VERSION};`,
      ],

      printImports(contract.imports, helpers),

      [
        ...printTopLevelComments(contract.topLevelComments, contract.natspecTags.length > 0),
        ...printNatspecTags(contract.natspecTags),
        [`contract ${contract.name}`, ...printInheritance(contract, helpers), '{'].join(' '),

        spaceBetween(
          printLibraries(contract, helpers),
          ...structs,
          printVariableOrErrorDefinitionsWithComments(contract.variableOrErrorDefinitions),
          printVariableOrErrorDefinitionsWithoutComments(contract.variableOrErrorDefinitions),
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

function printVariableOrErrorDefinitionsWithComments(variableOrErrorDefinitions: VariableOrErrorDefinition[]): Lines[] {
  const withComments = variableOrErrorDefinitions.filter(v => v.comments?.length);
  // Spaces between each item that has comments
  return spaceBetween(...withComments.map(v => [...v.comments!, v.code]));
}

function printVariableOrErrorDefinitionsWithoutComments(
  variableOrErrorDefinitions: VariableOrErrorDefinition[],
): Lines[] {
  const withoutComments = variableOrErrorDefinitions.filter(v => !v.comments?.length);
  // No spaces between items that don't have comments
  return withoutComments.map(v => v.code);
}

type LibraryDescription = {
  nameAndVersion: string;
  alwaysKeepOzPrefix?: boolean;
};

function printCompatibleLibraryVersions(contract: Contract, opts?: Options): string {
  const libraryDescriptions: LibraryDescription[] = [];
  if (importsLibrary(contract, '@openzeppelin/contracts')) {
    libraryDescriptions.push({ nameAndVersion: `OpenZeppelin Contracts ${compatibleContractsSemver}` });
  }
  if (importsLibrary(contract, '@openzeppelin/community-contracts')) {
    try {
      const commit = getCommunityContractsGitCommit();
      libraryDescriptions.push({ nameAndVersion: `OpenZeppelin Community Contracts commit ${commit}` });
    } catch (e) {
      console.error(e);
    }
  }
  if (opts?.additionalCompatibleLibraries) {
    for (const library of opts.additionalCompatibleLibraries) {
      if (importsLibrary(contract, library.path)) {
        libraryDescriptions.push({
          nameAndVersion: `${library.name} ${library.version}`,
          alwaysKeepOzPrefix: library.alwaysKeepOzPrefix,
        });
      }
    }
  }

  if (libraryDescriptions.length === 0) {
    return '';
  } else if (libraryDescriptions.length === 1) {
    return `// Compatible with ${libraryDescriptions[0]!.nameAndVersion}`;
  } else {
    const OZ_PREFIX_WITH_SPACE = 'OpenZeppelin ';
    if (libraryDescriptions[0]!.nameAndVersion.startsWith(OZ_PREFIX_WITH_SPACE)) {
      for (let i = 1; i < libraryDescriptions.length; i++) {
        if (
          libraryDescriptions[i]!.nameAndVersion.startsWith(OZ_PREFIX_WITH_SPACE) &&
          !libraryDescriptions[i]!.alwaysKeepOzPrefix
        ) {
          libraryDescriptions[i]!.nameAndVersion = libraryDescriptions[i]!.nameAndVersion.slice(
            OZ_PREFIX_WITH_SPACE.length,
          );
        }
      }
    }
    const librariesToPrint = libraryDescriptions.map(l => l.nameAndVersion);
    return `// Compatible with ${librariesToPrint.slice(0, -1).join(', ')} and ${librariesToPrint.slice(-1)}`;
  }
}

function printInheritance(contract: Contract, { transformName }: Helpers): [] | [string] {
  const visibleParents = contract.parents.filter(p => !p.constructionOnly);
  if (visibleParents.length > 0) {
    return ['is ' + visibleParents.map(p => transformName(p.contract)).join(', ')];
  }
  return [];
}

function printConstructor(contract: Contract, helpers: Helpers): Lines[] {
  const hasParentParams = contract.parents.some(p => p.params.length > 0);
  const hasConstructorCode = contract.constructorCode.length > 0;
  const parentsWithInitializers = contract.parents.filter(hasInitializer);
  if (hasParentParams || hasConstructorCode || (helpers.upgradeable && parentsWithInitializers.length > 0)) {
    if (helpers.upgradeable) {
      const upgradeableParents = parentsWithInitializers.filter(p => inferTranspiled(p.contract));
      // Omit Initializable and UUPSUpgradeable since they don't have explicit constructors
      const nonUpgradeableParentsWithConstructors = contract.parents.filter(
        p =>
          !inferTranspiled(p.contract) && p.contract.name !== 'Initializable' && p.contract.name !== 'UUPSUpgradeable',
      );
      const constructor = printFunction2(
        [
          nonUpgradeableParentsWithConstructors.length > 0
            ? '/// @custom:oz-upgrades-unsafe-allow-reachable constructor'
            : '/// @custom:oz-upgrades-unsafe-allow constructor',
        ],
        'constructor',
        [],
        nonUpgradeableParentsWithConstructors.flatMap(p => printParentConstructor(p, helpers)),
        ['_disableInitializers();'],
      );
      const initializer = printFunction2(
        [],
        'function initialize',
        contract.constructorArgs.map(a => printArgument(a, helpers)),
        ['public', 'initializer'],
        spaceBetween(
          upgradeableParents.flatMap(p => printParentConstructor(p, helpers)).map(p => p + ';'),
          contract.constructorCode,
        ),
      );
      return spaceBetween(constructor, upgradeableParents.length > 0 ? initializer : []);
    } else {
      return printFunction2(
        [],
        'constructor',
        contract.constructorArgs.map(a => printArgument(a, helpers)),
        contract.parents.flatMap(p => printParentConstructor(p, helpers)),
        contract.constructorCode,
      );
    }
  } else if (!helpers.upgradeable) {
    return [];
  } else {
    return DISABLE_INITIALIZERS;
  }
}

const DISABLE_INITIALIZERS = [
  '/// @custom:oz-upgrades-unsafe-allow constructor',
  'constructor() {',
  ['_disableInitializers();'],
  '}',
];

function hasInitializer(parent: Parent) {
  // CAUTION
  // This list is validated by compilation of SafetyCheck.sol.
  // Always keep this list and that file in sync.
  return !['Initializable'].includes(parent.contract.name);
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
  const useTranspiled = helpers.upgradeable && inferTranspiled(contract);
  const fn = useTranspiled ? `__${contract.name}_init` : contract.name;
  if (useTranspiled || params.length > 0) {
    return [fn + '(' + params.map(printValue).join(', ') + ')'];
  } else {
    return [];
  }
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
    return stringifyUnicodeSafe(value);
  }
}

function printFunction(fn: ContractFunction, helpers: Helpers): Lines[] {
  const { transformName } = helpers;

  if (fn.override.size <= 1 && fn.modifiers.length === 0 && fn.code.length === 0 && !fn.final) {
    return [];
  }
  const modifiers: string[] = [fn.kind];

  if (fn.mutability !== 'nonpayable') {
    modifiers.push(fn.mutability);
  }

  if (fn.override.size === 1) {
    modifiers.push(`override`);
  } else if (fn.override.size > 1) {
    modifiers.push(`override(${[...fn.override].map(transformName).join(', ')})`);
  }

  modifiers.push(...fn.modifiers);

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
      fn.comments,
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
function printFunction2(
  comments: string[],
  kindedName: string,
  args: string[],
  modifiers: string[],
  code: Lines[],
): Lines[] {
  const fn: Lines[] = [...comments];

  const headingLength = [kindedName, ...args, ...modifiers].map(s => s.length).reduce((a, b) => a + b);

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

function printStruct(_struct: ContractStruct): Lines[] {
  const [comments, kindedName, code] = [_struct.comments, _struct.name, _struct.variables];
  const struct: Lines[] = [...comments];

  const braces = code.length > 0 ? '{' : '{}';
  struct.push([`struct ${kindedName}`, braces].join(' '));

  if (code.length > 0) {
    struct.push(code, '}');
  }

  return struct;
}

function printArgument(arg: FunctionArgument, { transformName }: Helpers): string {
  let type: string;
  if (typeof arg.type === 'string') {
    if (/^[A-Z]/.test(arg.type)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      `Type ${arg.type} is not a primitive type. Define it as a ContractReference`;
    }
    type = arg.type;
  } else {
    type = transformName(arg.type);
  }

  return [type, arg.name].join(' ');
}

function printTopLevelComments(comments: string[], withExtraBlankLine: boolean = false): string[] {
  const lines = comments.map(comment => `// ${comment}`);
  if (comments.length > 0 && withExtraBlankLine) lines.push('//');
  return lines;
}

function printNatspecTags(tags: NatspecTag[]): string[] {
  return tags.map(({ key, value }) => `/// ${key} ${value}`);
}

function printImports(imports: ImportContract[], helpers: Helpers): string[] {
  const itemByPath = new Map<string, Set<string>>();

  for (const p of imports) {
    const { name, path } = helpers.transformImport(p);
    const _ = itemByPath.get(path)?.add(name) ?? itemByPath.set(path, new Set([name]));
  }

  return Array.from(itemByPath.keys())
    .sort()
    .map(path => `import {${Array.from(itemByPath.get(path)!).sort().join(', ')}} from "${path}";`);
}

function printLibraries(contract: Contract, { transformName }: Helpers): string[] {
  if (!contract.libraries || contract.libraries.length === 0) return [];

  return contract.libraries
    .sort((a, b) => a.library.name.localeCompare(b.library.name)) // Sort by import path
    .map(lib => {
      const sortedTypes = Array.from(lib.usingFor).sort((a, b) => a.localeCompare(b)); // Sort types
      return `using ${transformName(lib.library)} for ${sortedTypes.join(', ')};`;
    });
}
