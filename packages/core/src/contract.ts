import { toIdentifier } from './utils/to-identifier';

export interface Contract {
  name: string;
  license: string;
  parents: Parent[];
  natspecTags: NatspecTag[];
  imports: ParentContract[];
  functions: ContractFunction[];
  constructorCode: string[];
  constructorArgs: FunctionArgument[];
  variables: string[];
  upgradeable: boolean;
}

export type Value = string | number | { lit: string } | { note: string, value: Value };

export interface Parent {
  contract: ParentContract;
  params: Value[];
}

export interface ParentContract extends ReferencedContract {
  path: string;
}

export interface ReferencedContract {
  name: string;
  transpiled?: boolean;
}

export interface Using {
  library: ParentContract;
  usingFor: string;
}

export interface BaseFunction {
  name: string;
  args: FunctionArgument[];
  returns?: string[];
  kind: FunctionKind;
  mutability?: FunctionMutability;
}

export interface ContractFunction extends BaseFunction {
  override: Set<ReferencedContract>;
  modifiers: string[];
  code: string[];
  mutability: FunctionMutability;
  final: boolean;
  comments: string[];
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
  type: string | ReferencedContract;
  name: string;
}

export interface NatspecTag {
  key: string;
  value: string;
}

export class ContractBuilder implements Contract {
  readonly name: string;
  license: string = 'MIT';
  upgradeable = false;

  readonly using: Using[] = [];
  readonly natspecTags: NatspecTag[] = [];

  readonly constructorArgs: FunctionArgument[] = [];
  readonly constructorCode: string[] = [];
  readonly variableSet: Set<string> = new Set();

  private parentMap: Map<string, Parent> = new Map<string, Parent>();
  private functionMap: Map<string, ContractFunction> = new Map();

  constructor(name: string) {
    this.name = toIdentifier(name, true);
  }

  get parents(): Parent[] {
    return [...this.parentMap.values()].sort((a, b) => {
      if (a.contract.name === 'Initializable') {
        return -1;
      } else if (b.contract.name === 'Initializable') {
        return 1;
      } else {
        return 0;
      }
    });
  }

  get imports(): ParentContract[] {
    return [
      ...[...this.parentMap.values()].map(p => p.contract),
      ...this.using.map(u => u.library),
    ];
  }

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  get variables(): string[] {
    return [...this.variableSet];
  }

  addParent(contract: ParentContract, params: Value[] = []): boolean {
    const present = this.parentMap.has(contract.name);
    this.parentMap.set(contract.name, { contract, params });
    return !present;
  }

  addOverride(parent: ReferencedContract, baseFn: BaseFunction, mutability?: FunctionMutability) {
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

  addNatspecTag(key: string, value: string) {
    if (!/^(@custom:)?[a-z][a-z\-]*$/.exec(key)) throw new Error(`Invalid natspec key: ${key}`);
    this.natspecTags.push({ key, value });
  }

  private addFunction(baseFn: BaseFunction): ContractFunction {
    const signature = [baseFn.name, '(', ...baseFn.args.map(a => a.name), ')'].join('');
    const got = this.functionMap.get(signature);
    if (got !== undefined) {
      return got;
    } else {
      const fn: ContractFunction = {
        override: new Set<ReferencedContract>(),
        modifiers: [],
        code: [],
        mutability: 'nonpayable',
        final: false,
        comments: [],
        ...baseFn,
      };
      this.functionMap.set(signature, fn);
      return fn;
    }
  }

  addConstructorArgument(arg: FunctionArgument) {
    this.constructorArgs.push(arg);
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

  setFunctionBody(code: string[], baseFn: BaseFunction, mutability?: FunctionMutability) {
    const fn = this.addFunction(baseFn);
    if (fn.code.length > 0) {
      throw new Error(`Function ${baseFn.name} has additional code`);
    }
    fn.code.push(...code);
    fn.final = true;
    if (mutability) {
      fn.mutability = mutability;
    }
  }

  setFunctionComments(comments: string[], baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    if (fn.comments.length > 0) {
      throw new Error(`Function ${baseFn.name} already has comments`);
    }
    fn.comments = comments;
  }

  /**
   * Note: The type in the variable is not currently transpiled, even if it refers to a contract
   */
  addVariable(code: string): boolean {
    const present = this.variableSet.has(code);
    this.variableSet.add(code);
    return !present;
  }
}
