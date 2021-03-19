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
  kind: FunctionKind;
}

export interface ContractFunction extends BaseFunction {
  override: string[];
  modifiers: string[];
  code: string[];
  final: boolean;
}

export type FunctionKind = 'internal' | 'public';

export interface FunctionArgument {
  type: string;
  name: string;
}

export class ContractBuilder implements Contract {
  license = 'MIT';

  readonly constructorCode: string[] = [];
  readonly variables: string[] = [];

  private parentMap: Map<string, Parent> = new Map();
  private functionMap: Map<string, ContractFunction> = new Map();

  constructor(readonly name: string) {}

  get parents(): Parent[] {
    return [...this.parentMap.values()];
  }

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  addParent(contract: ParentContract, params: string[] = []) {
    this.parentMap.set(contract.name, { contract, params });
  }

  addOverride(parent: string, baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    fn.override.push(parent);
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
      const fn = { ...baseFn, override: [], modifiers: [], code: [], final: false };
      this.functionMap.set(signature, fn);
      return fn;
    }
  }

  addConstructorCode(code: string) {
    this.constructorCode.push(code);
  }

  addFunctionCode(code: string, baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    if (fn.final) {
      throw new Error(`Function ${baseFn.name} is already finalized`);
    }
    fn.code.push(code);
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
    this.variables.push(code);
  }
}
