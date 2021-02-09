import 'array.prototype.flatmap/auto';

import { formatLines, newline, Lines } from './utils/format-lines';
import { intersperse } from './utils/intersperse';

const SOLIDITY_VERSION = '0.8.0';

export interface Contract {
  name: string;
  license: string;
  parents: Parent[];
  functions: ContractFunction[];
}

interface Parent {
  contract: ParentContract;
  params: string[];
}

interface ParentContract {
  name: string;
  path: string;
}

interface ParentFunction {
  name: string;
  args: FunctionArgument[];
  kind: FunctionKind;
}

interface ContractFunction extends ParentFunction {
  override: string[];
}

type FunctionKind = 'internal' | 'public';

interface FunctionArgument {
  type: string;
  name: string;
}

type FunctionArgumentShorthand = [type: string, name: string];

export class ContractBuilder implements Contract {
  license = 'MIT';

  readonly parents: Parent[] = [];
  private functionMap: Map<string, ContractFunction> = new Map();

  constructor(readonly name: string) {}

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  addParent(contract: ParentContract, params: string[] = []) {
    this.parents.push({ contract, params });
  }

  addOverride(parent: string, parentFn: ParentFunction) {
    const fn = this.addFunction(parentFn);
    fn.override.push(parent);
  }

  private addFunction(parentFn: ParentFunction): ContractFunction {
    const signature = [parentFn.name, '(', ...parentFn.args.map(a => a.name), ')'].join('');
    const got = this.functionMap.get(signature);
    if (got !== undefined) {
      return got;
    } else {
      const fn = { ...parentFn, override: [] };
      this.functionMap.set(signature, fn);
      return fn;
    }
  }
}

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
