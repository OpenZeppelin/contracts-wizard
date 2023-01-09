import { withImplicitArgs } from './common-options';
import { importHashBuiltin } from './utils/hash-builtin';
import { getImportName } from './utils/module-prefix';

export interface Contract {
  license: string;
  libraries: Library[];
  functions: ContractFunction[];
  constructorCode: string[];
  constructorImplicitArgs?: Argument[];
  constructorArgs: Argument[];
  variables: string[];
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
  useNamespace: boolean;
}

export interface Initializer {
  params: Value[];
}

/**
 * Whether the function should directly return the parent function's return value.
 * If false, call the parent function without returning its value.
 * If true, return directly from the call to the parent function.
 * If 'strict', treat as `true` but uses the return arguments' names.
 */
export type PassthroughOption = true | false | 'strict'; 

export interface BaseFunction {
  module?: Module;
  name: string;
  implicitArgs?: Argument[];
  args: Argument[];
  returns?: Argument[];
  kind?: FunctionKind;
  passthrough?: PassthroughOption;
  read?: boolean;
  parentFunctionName?: string;
}

export interface ContractFunction extends BaseFunction {
  libraryCalls: LibraryCall[];
  code: string[];
  final: boolean;
}

export interface LibraryCall {
  callFn: BaseFunction;
  args: string[];
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
  readonly variableSet: Set<string> = new Set();

  private librariesMap: Map<Module, Library> = new Map<Module, Library>();
  private functionMap: Map<string, ContractFunction> = new Map();
  readonly constructorImplicitArgs: Argument[] = withImplicitArgs();

  get libraries(): Library[] {
    return [...this.librariesMap.values()];
  }

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  get variables(): string[] {
    return [...this.variableSet];
  }

  addModule(module: Module, params: Value[] = [], functions: BaseFunction[] = [], initializable: boolean = true): boolean {
    const key = module;
    const present = this.librariesMap.has(key);
    const initializer = initializable ? { params } : undefined;

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

  addLibraryCall(callFn: BaseFunction, baseFn: BaseFunction, args: string[] = []) {
    const fn = this.addFunction(baseFn);
    if (callFn.module !== undefined) {
      this.addModuleFunction(callFn.module, getImportName(callFn));
    }
    const libraryCall: LibraryCall = { callFn, args };
    fn.libraryCalls.push(libraryCall);
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

  addVariable(code: string): boolean {
    const present = this.variableSet.has(code);
    this.variableSet.add(code);
    return !present;
  }
}
