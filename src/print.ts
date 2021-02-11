import 'array.prototype.flatmap/auto';

import { Contract, Parent, ContractFunction, FunctionArgument } from './contract';

import { formatLines, newline, Lines } from './utils/format-lines';
import { intersperse } from './utils/intersperse';

const SOLIDITY_VERSION = '0.8.0';

export function printContract(contract: Contract): string {
  return formatLines(
    `// SPDX-License-Identifier: ${contract.license}`,

    `pragma solidity ^${SOLIDITY_VERSION};`,

    newline,

    ...contract.parents.map(p => `import "${p.contract.path}";`),

    newline,

    [`contract ${contract.name}`, ...printInheritance(contract), '{'].join(' '),

    printConstructor(contract),

    ...intersperse(
      contract.functions.map(printFunction),
      newline,
    ),

    `}`,
  );
}

function printInheritance(contract: Contract): [] | [string] {
  if (contract.parents.length > 0) {
    return ['is ' + contract.parents.map(p => p.contract.name).join(', ')];
  } else {
    return [];
  }
}

function printConstructor(contract: Contract): Lines {
  const hasParentParams = contract.parents.some(p => p.params.length > 0);
  const hasConstructorCode = contract.constructorCode.length > 0;
  if (hasParentParams || hasConstructorCode) {
    return [
      [
        `constructor()`,
        ...contract.parents.flatMap(printParentConstructor),
        `{`,
      ].join(' '),
      contract.constructorCode,
      `}`
    ];
  } else {
    return [];
  }
}

function printParentConstructor({ contract, params }: Parent): [] | [string] {
  if (params.length > 0) {
    return [
      contract.name + '(' + params.map(x => '"' + x + '"').join(', ') + ')',
    ];
  } else {
    return [];
  }
}

function printFunction(fn: ContractFunction): Lines {
  const modifiers = [...fn.modifiers];
  const code = [...fn.code];

  if (fn.override.length > 1) {
    modifiers.push(`override(${fn.override.join(', ')})`);
  }

  if (fn.override.length > 0) {
    code.push(`super.${fn.name}(${fn.args.map(a => a.name).join(', ')});`);
  }

  if (modifiers.length + fn.code.length > 0) {
    return [
      `function ${fn.name}(${fn.args.map(printArgument).join(', ')})`,
      [fn.kind, ...modifiers],
      '{',
      code,
      '}',
    ];
  } else {
    return [];
  }
}

function printArgument(arg: FunctionArgument): string {
  return [arg.type, arg.name].join(' ');
}
