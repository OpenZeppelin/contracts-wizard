import { toIdentifier } from './utils/to-identifier';

export interface Contract {
  name: string;
  license: string;
  parents: Parent[];
  functions: ContractFunction[];
  constructorCode: string[];
  variables: string[];
}

export interface Parent {
  contract: ParentContract;
  params: string[];
}

export interface ParentContract {
  name: string;
  path: string;
}

export interface BaseFunction {
  name: string;
  args: FunctionArgument[];
  returns?: string[];
  kind: FunctionKind;
  mutability?: FunctionMutability;
}

export interface ContractFunction extends BaseFunction {
  override: Set<String>;
  modifiers: string[];
  code: string[];
  mutability: FunctionMutability;
  final: boolean;
}

export type FunctionKind = 'internal' | 'public';
export type FunctionMutability = typeof mutabilityRank[number];

// Order is important
const mutabilityRank = ['pure', 'view', 'nonpayable', 'payable'] as const;

function maxMutability(a: FunctionMutability, b: FunctionMutability): FunctionMutability {
  return mutabilityRank[
    Math.max(mutabilityRank.indexOf(a), mutabilityRank.indexOf(b))
  ]!;
}

export interface FunctionArgument {
  type: string;
  name: string;
}

export class ContractBuilder implements Contract {
  readonly license = 'MIT';
  readonly name: string;

  readonly constructorCode: string[] = [];
  readonly variableSet: Set<string> = new Set();

  private parentMap: Map<string, Parent> = new Map<string, Parent>();
  private functionMap: Map<string, ContractFunction> = new Map();

  constructor(name: string) {
    this.name = toIdentifier(name, true);
  }

  get parents(): Parent[] {
    return [...this.parentMap.values()];
  }

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  get variables(): string[] {
    return [...this.variableSet];
  }

  addParent(contract: ParentContract, params: string[] = []) {
    this.parentMap.set(contract.name, { contract, params });
  }

  addOverride(parent: string, baseFn: BaseFunction, mutability?: FunctionMutability) {
    const fn = this.addFunction(baseFn);
    fn.override.add(parent);
    if (mutability) {
      fn.mutability = maxMutability(fn.mutability, mutability);
    }
  }

  addModifier(modifier: string, baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    fn.modifiers.push(modifier);
  }

  private addFunction(baseFn: BaseFunction): ContractFunction {
    const signature = [baseFn.name, '(', ...baseFn.args.map(a => a.name), ')'].join('');
    const got = this.functionMap.get(signature);
    if (got !== undefined) {
      return got;
    } else {
      const fn: ContractFunction = {
        override: new Set<string>(),
        modifiers: [],
        code: [],
        mutability: 'nonpayable',
        final: false,
        ...baseFn,
      };
      this.functionMap.set(signature, fn);
      return fn;
    }
  }

  addConstructorCode(code: string) {
    this.constructorCode.push(code);
  }

  addFunctionCode(code: string, baseFn: BaseFunction, mutability?: FunctionMutability) {
    const fn = this.addFunction(baseFn);
    if (fn.final) {
      throw new Error(`Function ${baseFn.name} is already finalized`);
    }
    fn.code.push(code);
    if (mutability) {
      fn.mutability = maxMutability(fn.mutability, mutability);
    }
  }

  setFunctionBody(code: string, baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    if (fn.code.length > 0) {
      throw new Error(`Function ${baseFn.name} has additional code`);
    }
    fn.code.push(code);
    fn.final = true;
  }

  addVariable(code: string) {
    this.variableSet.add(code);
  }
}
