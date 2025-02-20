import { toIdentifier } from './utils/convert-strings';

export interface Contract {
  license: string;
  name: string;
  useClauses: UseClause[];
  implementedTraits: ImplementedTrait[];
  constants: Variable[];
}

export interface Storage {
  name: string;
  type: string;
}

export interface UseClause {
  containerPath: string;
  name: string;
  groupable?: boolean;
  alias?: string;
}

export interface BaseImplementedTrait {
  name: string;
  storage: Storage;
  section?: string;
  /**
   * Priority for which trait to print first.
   * Lower numbers are higher priority, undefined is lowest priority.
   */
  priority?: number;
}

export interface ImplementedTrait extends BaseImplementedTrait {
  functions: ContractFunction[];
}

export interface BaseFunction {
  name: string;
  args: Argument[];
  code: string[];
  visibility?: 'pub';
  returns?: string;
  comments?: string[];
}

export interface ContractFunction extends BaseFunction {
  codeBefore?: string[];
  tag?: string;
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
  readonly name: string;
  license = 'MIT';

  private implementedTraitsMap: Map<string, ImplementedTrait> = new Map();
  private useClausesMap: Map<string, UseClause> = new Map();
  private errorsMap: Map<string, Error> = new Map();
  private constantsMap: Map<string, Variable> = new Map();

  constructor(name: string) {
    this.name = toIdentifier(name, true);
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

  addImplementedTrait(baseTrait: BaseImplementedTrait): ImplementedTrait {
    const key = baseTrait.name;
    const existingTrait = this.implementedTraitsMap.get(key);
    if (existingTrait !== undefined) {
      return existingTrait;
    } else {
      const t: ImplementedTrait = {
        name: baseTrait.name,
        functions: [],
        storage: baseTrait.storage,
        section: baseTrait.section,
        priority: baseTrait.priority,
      };
      this.implementedTraitsMap.set(key, t);
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

  traitExists(name: string): boolean {
    return this.implementedTraitsMap.has(name);
  }

  addFunction(baseTrait: BaseImplementedTrait, fn: BaseFunction): ContractFunction {
    const t = this.addImplementedTrait(baseTrait);

    const signature = this.getFunctionSignature(fn);

    // Look for the existing function with the same signature and return it if found
    for (let i = 0; i < t.functions.length; i++) {
      const existingFn = t.functions[i];
      if (existingFn !== undefined && this.getFunctionSignature(existingFn) === signature) {
        return existingFn;
      }
    }

    // Otherwise, add the function
    const contractFn: ContractFunction = {
      ...fn,
      codeBefore: [],
    };
    t.functions.push(contractFn);
    return contractFn;
  }

  private getFunctionSignature(fn: BaseFunction): string {
    return [fn.name, '(', ...fn.args.map(a => a.name), ')'].join('');
  }

  addFunctionCodeBefore(baseTrait: BaseImplementedTrait, fn: BaseFunction, codeBefore: string[]): void {
    this.addImplementedTrait(baseTrait);
    const existingFn = this.addFunction(baseTrait, fn);
    existingFn.codeBefore = [...(existingFn.codeBefore ?? []), ...codeBefore];
  }

  addFunctionTag(baseTrait: BaseImplementedTrait, fn: BaseFunction, tag: string): void {
    this.addImplementedTrait(baseTrait);
    const existingFn = this.addFunction(baseTrait, fn);
    existingFn.tag = tag;
  }
}
