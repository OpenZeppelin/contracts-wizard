import { withImplicitArgs } from './common-options';
import { toIdentifier } from './utils/to-identifier';

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
  path: string;
  prefix?: string;
}

export interface Initializer {
  params: Value[];
}

export interface BaseFunction {
  module?: string;
  name: string;
  implicitArgs?: Argument[];
  args: Argument[];
  returns?: Argument[];
  returnValue?: string;
  kind?: FunctionKind;
  passthrough?: boolean;
  read?: boolean;
  parentFunctionName?: string;
}

export interface ContractFunction extends BaseFunction {
  libraryCalls: string[];
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
  readonly variableSet: Set<string> = new Set();

  /**
   * Library has { modulePath, prefix?, functions }
   */

  /**
   * Map of library prefix to Parent object
   */
  private parentMap: Map<string, Library> = new Map<string, Library>();
  private functionMap: Map<string, ContractFunction> = new Map();
  readonly constructorImplicitArgs: Argument[] = withImplicitArgs();

  get libraries(): Library[] {
    return [...this.parentMap.values()].sort((a, b) => {
      if (a.module.prefix === 'Initializable') {
        return -1;
      } else if (b.module.prefix === 'Initializable') {
        return 1;
      } else {
        return 0;
      }
    });
  }

  get imports(): string[] {
    return [
      ...[...this.parentMap.values()].map(p => p.module.path),
      // this is deleted, but figure out how to add the base functions here  ...this.using.map(u => u.library.path),
    ];
  }

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  get variables(): string[] {
    return [...this.variableSet];
  }

  addParentLibrary(module: Module, params: Value[] = [], functions: string[], initializable: boolean = true): boolean {
    const key = module.prefix ?? module.path;
    const present = this.parentMap.has(key);
    const initializer = initializable ? { params } : undefined;
    this.parentMap.set(key, { module, functions, initializer });
    return !present;
  }

  addParentFunctionImport(contractPrefix: string, addFunction: string) {
    const existing = this.parentMap.get(contractPrefix);
    if (existing === undefined) {
      throw new Error(`Parent contract ${contractPrefix} has not been added yet`);
    }
    existing.functions.push(addFunction);
  }

  addLibraryCall(modifier: string, baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    fn.libraryCalls.push(modifier);
  }

  addFunction(baseFn: BaseFunction): ContractFunction {
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
    // TODO fix this comparison
    let hasArg = false;
    this.constructorArgs.map(a => {
      if (a.name == arg.name) {
        hasArg = true;
        // TODO can't break out of this
      }
    });
    if (!hasArg) {
      this.constructorArgs.push(arg);
    }
  }

  addConstructorCode(code: string) {
    this.constructorCode.push(code);
  }

  addFunctionCode(code: string, baseFn: BaseFunction) {//}, mutability?: FunctionMutability) {
    const fn = this.addFunction(baseFn);
    if (fn.final) {
      throw new Error(`Function ${baseFn.name} is already finalized`);
    }
    fn.code.push(code);
    // if (mutability) {
    //  fn.mutability = maxMutability(fn.mutability, mutability);
    // }
  }

  setFunctionBody(code: string[], baseFn: BaseFunction) {//}, mutability?: FunctionMutability) {
    const fn = this.addFunction(baseFn);
    if (fn.code.length > 0) {
      throw new Error(`Function ${baseFn.name} has additional code`);
    }
    fn.code.push(...code);
    fn.final = true;
    // if (mutability) {
    //   fn.mutability = mutability;
    // }
  }

}
