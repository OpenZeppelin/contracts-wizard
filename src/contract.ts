export interface Contract {
  name: string;
  license: string;
  parents: Parent[];
  functions: ContractFunction[];
  constructorCode: string[];
}

export interface Parent {
  contract: ParentContract;
  params: string[];
}

export  interface ParentContract {
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
}

export type FunctionKind = 'internal' | 'public';

export interface FunctionArgument {
  type: string;
  name: string;
}

export class ContractBuilder implements Contract {
  license = 'MIT';

  readonly parents: Parent[] = [];
  readonly constructorCode: string[] = [];

  private functionMap: Map<string, ContractFunction> = new Map();

  constructor(readonly name: string) {}

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  addParent(contract: ParentContract, params: string[] = []) {
    this.parents.push({ contract, params });
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
      const fn = { ...baseFn, override: [], modifiers: [] };
      this.functionMap.set(signature, fn);
      return fn;
    }
  }

  addConstructorCode(code: string) {
    this.constructorCode.push(code);
  }
}
