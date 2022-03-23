import { withImplicitArgs } from './common-options';
import { toIdentifier } from './utils/to-identifier';

export interface Contract {
  name: string;
  license: string;
  parents: Parent[];
  natspecTags: NatspecTag[];
  imports: string[]; //
  functions: ContractFunction[];
  constructorCode: string[];
  constructorImplicitArgs?: FunctionArgument[];
  constructorArgs: FunctionArgument[];
  variables: string[];
  upgradeable: boolean; 
}

export type Value = string | number | { lit: string } | { note: string, value: Value };

export interface Parent {
  library: Library;
  params: Value[];
  functions: string[];
  initializable?: boolean;
}

export interface StandaloneImport {
  library: Library;
  functions: string[];
}

export interface Library {
  prefix: string;
  modulePath: string;
}

export interface BaseFunction {
  module?: string;
  name: string;
  implicitArgs?: FunctionArgument[];
  args: FunctionArgument[];
  returns?: FunctionArgument[];
  returnValue?: string;
  kind?: FunctionKind;
  passthrough?: boolean;
  read?: boolean;
}

export interface ContractFunction extends BaseFunction {
  libraryCalls: string[];
  code: string[];
  final: boolean;
}

export type FunctionKind = 'view' | 'external';

export interface FunctionArgument {
  name: string;
  type?: string;
}

export interface NatspecTag {
  key: string;
  value: string;
}

export class ContractBuilder implements Contract {
  readonly name: string;
  license: string = 'MIT';
  upgradeable = false;

  readonly natspecTags: NatspecTag[] = [];

  readonly constructorArgs: FunctionArgument[] = [];
  readonly constructorCode: string[] = [];
  readonly variableSet: Set<string> = new Set();

  private parentMap: Map<string, Parent> = new Map<string, Parent>();
  private functionMap: Map<string, ContractFunction> = new Map();
  readonly constructorImplicitArgs: FunctionArgument[] = withImplicitArgs();

  constructor(name: string) {
    this.name = toIdentifier(name, true);
  }

  get parents(): Parent[] {
    return [...this.parentMap.values()].sort((a, b) => {
      if (a.library.prefix === 'Initializable') {
        return -1;
      } else if (b.library.prefix === 'Initializable') {
        return 1;
      } else {
        return 0;
      }
    });
  }

  get imports(): string[] {
    return [
      ...[...this.parentMap.values()].map(p => p.library.modulePath),
      // this is deleted, but figure out how to add the base functions here  ...this.using.map(u => u.library.path),
    ];
  }

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  get variables(): string[] {
    return [...this.variableSet];
  }

  addParentLibrary(contract: Library, params: Value[] = [], functions: string[], initializable?: boolean): boolean {
    const present = this.parentMap.has(contract.prefix);
    this.parentMap.set(contract.prefix, { library: contract, params, functions, initializable });
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

  addNatspecTag(key: string, value: string) {
    if (!/^(@custom:)?[a-z][a-z\-]*$/.exec(key)) throw new Error(`Invalid natspec key: ${key}`);
    this.natspecTags.push({ key, value });
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



  addConstructorArgument(arg: FunctionArgument) {
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

  addVariable(code: string): boolean {
    const present = this.variableSet.has(code);
    this.variableSet.add(code);
    return !present;
  }
}
