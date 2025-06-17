import { escapeString, toIdentifier } from './utils/convert-strings';

type Name = {
  identifier: string;
  stringLiteral: string;
};

export interface Contract {
  license: string;
  name: Name;
  useClauses: UseClause[];
  implementedTraits: ImplementedTrait[];
  constants: Variable[];
  eip712Needed?: boolean;
  functions: ContractFunction[];
}

export interface Implementation {
  storageName: string;
  type: string;
  genericType?: string;
}

export interface Interface {
  name: string;
  associatedError?: boolean;
}

export interface UseClause {
  containerPath: string;
  name: string;
  groupable?: boolean;
  alias?: string;
}

export interface BaseImplementedTrait {
  implementation?: Implementation;
  interface: Interface;
  section?: string;
  /**
   * Priority for which trait to print first.
   * Lower numbers are higher priority, undefined is lowest priority.
   */
  priority?: number;
  omitInherit?: boolean;
  modulePath: string;
}

export interface ImplementedTrait extends BaseImplementedTrait {
  functions: ContractFunction[];
}

export interface Result {
  ok: string,
  err: 'Self::Error',
}

export interface BaseFunction {
  name: string;
  args: Argument[];
  code: string;
  returns?: string | Result;
  comments?: string[];
  attribute?: string;
}

export interface ContractFunction extends BaseFunction {
  codeBefore?: string[];
  codeAfter?: string[];
}

export interface Variable {
  name: string;
  type: string;
  value: string;
  comment?: string;
  inlineComment?: boolean;
}

export interface Argument {
  name: string;
  type?: string;
}

export class ContractBuilder implements Contract {
  readonly name: Name;
  license = 'MIT';

  private implementedTraitsMap: Map<string, ImplementedTrait> = new Map();
  private useClausesMap: Map<string, UseClause> = new Map();
  private errorsMap: Map<string, Error> = new Map();
  private constantsMap: Map<string, Variable> = new Map();
  private functionsArr: ContractFunction[] = [];

  eip712Needed?: boolean;

  constructor(name: string) {
    this.name = {
      identifier: toIdentifier(name, true),
      stringLiteral: escapeString(name),
    };
    this.addUseClause('stylus_sdk', 'prelude::*');
  }

  get implementedTraits(): ImplementedTrait[] {
    return [...this.implementedTraitsMap.values()];
  }

  get useClauses(): UseClause[] {
    return [...this.useClausesMap.values()];
  }

  get errors(): Error[] {
    return [...this.errorsMap.values()];
  }

  get constants(): Variable[] {
    return [...this.constantsMap.values()];
  }

  get functions(): ContractFunction[] {
    return [...this.functionsArr];
  }

  addUseClause(containerPath: string, name: string, options?: { groupable?: boolean; alias?: string }): void {
    // groupable defaults to true
    const groupable = options?.groupable ?? true;
    const alias = options?.alias ?? '';
    const uniqueName = alias.length > 0 ? alias : name;
    const present = this.useClausesMap.has(uniqueName);
    if (!present) {
      this.useClausesMap.set(uniqueName, { containerPath, name, groupable, alias });
    }
  }

  addImplementedTrait(baseTrait: ImplementedTrait): ImplementedTrait {
    const key = baseTrait.interface.name;
    const existingTrait = this.implementedTraitsMap.get(key);
    if (existingTrait !== undefined) {
      return existingTrait;
    } else {
      const t: ImplementedTrait = copy(baseTrait);
      this.implementedTraitsMap.set(key, t);
      if (baseTrait.implementation) {
        this.addUseClause(baseTrait.modulePath, baseTrait.implementation?.type);
      }
      this.addUseClause(baseTrait.modulePath, baseTrait.interface.name);
      return t;
    }
  }

  addConstant(constant: Variable): boolean {
    if (this.constantsMap.has(constant.name)) {
      return false;
    } else {
      this.constantsMap.set(constant.name, constant);
      return true;
    }
  }

  addEip712() {
    this.addUseClause('openzeppelin_stylus::utils::cryptography::eip712', 'IEip712');
    this.eip712Needed = true;
  }

  traitExists(name: string): boolean {
    return this.implementedTraitsMap.has(name);
  }

  addFunction(fn: BaseFunction, baseTrait?: ImplementedTrait): ContractFunction {    
    const t = baseTrait ? this.addImplementedTrait(baseTrait) : this;

    const signature = this.getFunctionSignature(fn);

    // Look for the existing function with the same signature and return it if found
    for (let i = 0; i < t.functions.length; i++) {
      const existingFn = t.functions[i];
      if (existingFn !== undefined && this.getFunctionSignature(existingFn) === signature) {
        return existingFn;
      }
    }

    // Otherwise, add the function
    const contractFn: ContractFunction = copy(fn);
    
    if (t === this) {
      t.functionsArr.push(contractFn);
    } else {
      t.functions.push(contractFn);
    }
    
    return contractFn;
  }

  private getFunctionSignature(fn: BaseFunction): string {
    return [fn.name, '(', ...fn.args.map(a => a.name), ')'].join('');
  }

  setFunctionCode(fn: BaseFunction, code: string, baseTrait?: ImplementedTrait): void {
    const existingFn = this.addFunction(fn, baseTrait);
    existingFn.code = code;
  }

  addFunctionCodeBefore(fn: BaseFunction, codeBefore: string[], baseTrait?: ImplementedTrait): void {
    const existingFn = this.addFunction(fn, baseTrait);
    existingFn.codeBefore = [...(existingFn.codeBefore ?? []), ...codeBefore];
  }

  addFunctionCodeAfter(fn: BaseFunction, codeAfter: string[], baseTrait?: ImplementedTrait): void {
    const existingFn = this.addFunction(fn, baseTrait);
    existingFn.codeAfter = [...(existingFn.codeAfter ?? []), ...codeAfter];
  }

  addFunctionAttribute(fn: BaseFunction, attribute: string, baseTrait?: ImplementedTrait): void {
    const existingFn = this.addFunction(fn, baseTrait);
    existingFn.attribute = attribute;
  }
}

function copy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}