export interface Contract {
  name: string;
  license: string;
  parents: Parent[];
  functions: ContractFunction[];
}

export interface Parent {
  contract: ParentContract;
  params: string[];
}

export  interface ParentContract {
  name: string;
  path: string;
}

export interface ParentFunction {
  name: string;
  args: FunctionArgument[];
  kind: FunctionKind;
}

export interface ContractFunction extends ParentFunction {
  override: string[];
}

export type FunctionKind = 'internal' | 'public';

export interface FunctionArgument {
  type: string;
  name: string;
}

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
