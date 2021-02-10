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
  if (contract.parents.some(p => p.params.length > 0)) {
    return [
      [
        `constructor()`,
        ...contract.parents.flatMap(printParentConstructor),
        `{}`,
      ].join(' '),
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
  if (fn.override.length > 1) {
    return [
      `function ${fn.name}(${fn.args.map(printArgument).join(', ')})`,
      [fn.kind, `override(${fn.override.join(', ')})`],
      '{',
      [`super.${fn.name}(${fn.args.map(a => a.name).join(', ')});`],
      '}',
    ];
  } else {
    return [];
  }
}

function printArgument(arg: FunctionArgument): string {
  return [arg.type, arg.name].join(' ');
}
