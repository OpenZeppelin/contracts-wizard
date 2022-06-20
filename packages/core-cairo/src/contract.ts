import { withImplicitArgs } from './common-options';
import { importHashBuiltin } from './utils/hash-builtin';
import { getFunctionName, getImportName } from './utils/module-prefix';

export interface Contract {
  license: string;
  libraries: Library[];
  functions: ContractFunction[];
  constructorCode: string[];
  constructorImplicitArgs?: Argument[];
  constructorArgs: Argument[];
  upgradeable: boolean; 
}

export type Value = string | number | { lit: string } | { note: string, value: Value };

export interface Library {
  module: Module;
  functions: string[];
  initializer?: Initializer;
}

export interface Module {
  name: string;
  path: string;
  usePrefix: boolean;
}

export interface Initializer {
  params: Value[];
  namespace?: Namespace;
}

export interface Namespace {
  module: Module;
  name: string;
}

export interface BaseFunction {
  module?: Module;
  name: string;
  implicitArgs?: Argument[];
  args: Argument[];
  returns?: Argument[];
  returnValue?: string;
  kind?: FunctionKind;
  passthrough?: boolean;
  read?: boolean;
  parentFunctionName?: string;
  namespace?: Namespace;
}

export interface ContractFunction extends BaseFunction {
  libraryCalls: BaseFunction[];
  code: string[];
  final: boolean;
}

export type FunctionKind = 'view' | 'external';

export interface Argument {
  name: string;
  type?: string;
}

export interface NatspecTag {
  key: string;
  value: string;
}

export class ContractBuilder implements Contract {
  license: string = 'MIT';
  upgradeable = false;

  readonly constructorArgs: Argument[] = [];
  readonly constructorCode: string[] = [];

  private librariesMap: Map<Module, Library> = new Map<Module, Library>();
  private functionMap: Map<string, ContractFunction> = new Map();
  readonly constructorImplicitArgs: Argument[] = withImplicitArgs();

  get libraries(): Library[] {
    return [...this.librariesMap.values()];
  }

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  addModule(module: Module, params: Value[] = [], functions: BaseFunction[] = [], initializable: boolean = true, initializerNamespace?: Namespace): boolean {
    const key = module;
    const present = this.librariesMap.has(key);
    const initializer = initializable ? { params, namespace: initializerNamespace } : undefined;

    if (initializer !== undefined && initializer.params.length > 0) {
      // presence of initializer params implies initializer code will be written, so implicit args must be included
      importHashBuiltin(this);
    }

    const functionStrings: string[] = [];
    functions.forEach(fn => {
      functionStrings.push(getImportName(fn));
    });
    if (initializable) {
      functionStrings.push(getImportName({
          module: module,
          namespace: initializerNamespace,
          name: 'initializer', 
          args: []
        }))
    }

    this.librariesMap.set(module, { module, functions: functionStrings, initializer });
    return !present;
  }

  addModuleFunction(module: Module, addFunction: string) {
    const existing = this.librariesMap.get(module);
    if (existing === undefined) {
      throw new Error(`Module ${module} has not been added yet`);
    }
    if (!existing.functions.includes(addFunction)) {
      existing.functions.push(addFunction);
    }
  }

  addLibraryCall(callFn: BaseFunction, baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    if (callFn.module !== undefined) {
      this.addModuleFunction(callFn.module, getImportName(callFn));
    }
    if (callFn.args.length > 0) {
      throw new Error(`Library call with functions is not supported yet`);
    }
    fn.libraryCalls.push(callFn);
  }

  addFunction(baseFn: BaseFunction): ContractFunction {
    importHashBuiltin(this);

    const signature = [baseFn.name, '(', ...baseFn.args.map(a => a.name), ')'].join('');
    const got = this.functionMap.get(signature);
    if (got !== undefined) {
      return got;
    } else {
      const fn: ContractFunction = {
        libraryCalls: [],
        code: [],
        final: false,
        ...baseFn,
      };
      this.functionMap.set(signature, fn);
      return fn;
    }
  }

  addConstructorArgument(arg: Argument) {
    for (const existingArg of this.constructorArgs) {
      if (existingArg.name == arg.name) {
        return;
      }
    }
    this.constructorArgs.push(arg);
  }

  addConstructorCode(code: string) {
    importHashBuiltin(this);
    
    this.constructorCode.push(code);
  }

  addFunctionCode(code: string, baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    if (fn.final) {
      throw new Error(`Function ${baseFn.name} is already finalized`);
    }
    fn.code.push(code);
  }

  setFunctionBody(code: string[], baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    if (fn.code.length > 0) {
      throw new Error(`Function ${baseFn.name} has additional code`);
    }
    fn.code.push(...code);
    fn.final = true;
  }

}
