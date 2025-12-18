import { toByteArray, toIdentifier } from './utils/convert-strings';

export interface Contract {
  metadata: Map<string, string>;
  license: string;
  documentations: string[];
  name: string;
  useClauses: UseClause[];
  constructorCode: string[];
  constructorArgs: Argument[];
  implementedTraits: TraitImplBlock[];
  freeFunctions: ContractFunction[];
  variables: Variable[];
  errors: Error[];
  ownable: boolean;
  derives: string[];
}

export interface Error {
  name: string;
  num: number;
}

export type Value = string | number | bigint | { lit: string } | { note: string; value: Value };

export interface UseClause {
  containerPath: string;
  name: string;
  groupable?: boolean;
  alias?: string;
}

export interface BaseTraitImplBlock {
  traitName: string;
  structName: string;
  tags: string[];
  assocType?: string;
  section?: string;
  /**
   * Priority for which trait to print first.
   * Lower numbers are higher priority, undefined is lowest priority.
   */
  priority?: number;
}

export interface TraitImplBlock extends BaseTraitImplBlock {
  functions: ContractFunction[];
}

export interface BaseFunction {
  name: string;
  args: Argument[];
  code: string[];
  pub?: boolean;
  returns?: string;
}

export interface ContractFunction extends BaseFunction {
  tags: string[];
  codeBefore?: string[];
}

export interface Variable {
  name: string;
  type: string;
  value: string;
}

export interface Argument {
  name: string;
  type?: string;
}

export class ContractBuilder implements Contract {
  readonly name: string;
  license = 'MIT';
  metadata = new Map<string, string>();
  ownable = false;

  readonly documentations: string[] = [];

  readonly constructorArgs: Argument[] = [];
  readonly constructorCode: string[] = [];

  private implementedTraitsMap: Map<string, TraitImplBlock> = new Map();
  private freeFunctionsMap: Map<string, ContractFunction> = new Map();
  private variablesMap: Map<string, Variable> = new Map();
  private useClausesMap: Map<string, UseClause> = new Map();
  private errorsMap: Map<string, Error> = new Map();
  private derivesSet: Set<string> = new Set();

  constructor(name: string) {
    this.name = toIdentifier(name, true);
  }

  get implementedTraits(): TraitImplBlock[] {
    return [...this.implementedTraitsMap.values()];
  }

  get freeFunctions(): ContractFunction[] {
    return [...this.freeFunctionsMap.values()];
  }

  get variables(): Variable[] {
    return [...this.variablesMap.values()];
  }

  get useClauses(): UseClause[] {
    return [...this.useClausesMap.values()];
  }

  get errors(): Error[] {
    return [...this.errorsMap.values()];
  }

  get derives(): string[] {
    return [...this.derivesSet];
  }

  addError(name: string, num: number): boolean {
    if (this.errorsMap.has(name)) {
      return false;
    } else {
      this.addUseClause('soroban_sdk', 'contracterror');
      this.errorsMap.set(name, { name, num });
      return true;
    }
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

  addVariable(variable: Variable): boolean {
    if (this.variablesMap.has(variable.name)) {
      return false;
    } else {
      this.variablesMap.set(variable.name, variable);
      return true;
    }
  }

  addTraitImplBlock(baseTrait: BaseTraitImplBlock): TraitImplBlock {
    const key = baseTrait.traitName;
    const existingTrait = this.implementedTraitsMap.get(key);
    if (existingTrait !== undefined) {
      return existingTrait;
    } else {
      const t: TraitImplBlock = {
        traitName: baseTrait.traitName,
        structName: baseTrait.structName,
        tags: [...baseTrait.tags],
        assocType: baseTrait.assocType,
        functions: [],
        section: baseTrait.section,
        priority: baseTrait.priority,
      };
      this.implementedTraitsMap.set(key, t);
      return t;
    }
  }

  // used for adding a function to the `impl Contract` block
  addFreeFunction(fn: BaseFunction): ContractFunction {
    const signature = this.getFunctionSignature(fn);
    const existingFn = this.freeFunctionsMap.get(signature);
    if (existingFn !== undefined) {
      return existingFn;
    } else {
      const contractFn: ContractFunction = {
        ...fn,
        pub: true,
        tags: [],
        codeBefore: [],
      };
      this.freeFunctionsMap.set(signature, contractFn);
      return contractFn;
    }
  }

  addTraitForEachFunctions(baseTrait: BaseTraitImplBlock, functions: Record<string, BaseFunction>) {
    Object.values(functions).forEach(fn => this.addTraitFunction(baseTrait, fn));
  }

  // used for adding a function to a trait implementation block
  addTraitFunction(baseTrait: BaseTraitImplBlock, fn: BaseFunction): ContractFunction {
    const t = this.addTraitImplBlock(baseTrait);

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
      tags: [],
      codeBefore: [],
    };
    t.functions.push(contractFn);
    return contractFn;
  }

  overrideAssocType(traitName: string, newAssocType: string): void {
    const trait = this.implementedTraitsMap.get(traitName);
    if (trait) {
      trait.assocType = newAssocType;
    } else {
      throw new Error(`Trait '${traitName}' does not exist and cannot be overridden.`);
    }
  }

  private getFunctionSignature(fn: BaseFunction): string {
    return [fn.name, '(', ...fn.args.map(a => a.name), ')'].join('');
  }

  private getOrCreateFunction(fn: BaseFunction, baseTrait?: BaseTraitImplBlock): ContractFunction {
    if (baseTrait === undefined) {
      return this.addFreeFunction(fn);
    } else {
      this.addTraitImplBlock(baseTrait);
      return this.addTraitFunction(baseTrait, fn);
    }
  }

  addFunctionCodeBefore(fn: BaseFunction, codeBefore: string[], baseTrait?: BaseTraitImplBlock): void {
    const existingFn = this.getOrCreateFunction(fn, baseTrait);
    existingFn.codeBefore = [...(existingFn.codeBefore ?? []), ...codeBefore];
  }

  addFunctionTag(fn: BaseFunction, tag: string, baseTrait?: BaseTraitImplBlock): void {
    const existingFn = this.getOrCreateFunction(fn, baseTrait);
    existingFn.tags = [...(existingFn.tags ?? []), tag];
  }

  setFunctionCode(fn: BaseFunction, code: string[], baseTrait?: BaseTraitImplBlock): void {
    const existingFn = this.getOrCreateFunction(fn, baseTrait);
    existingFn.code = [...code];
  }

  addConstructorArgument(arg: Argument): void {
    for (const existingArg of this.constructorArgs) {
      if (existingArg.name == arg.name) {
        return;
      }
    }
    this.constructorArgs.push(arg);
  }

  addConstructorCode(code: string): void {
    for (const existingCode of this.constructorCode) {
      if (existingCode === code) {
        return;
      }
    }
    this.constructorCode.push(code);
  }

  addDerives(derive: string): void {
    this.derivesSet.add(derive);
  }

  addDocumentation(description: string) {
    this.documentations.push(description);
  }

  addContractMetadata(metadata: { key: string; value: string }[] | { key: string; value: string }) {
    (Array.isArray(metadata) ? metadata : [metadata]).forEach(({ key, value }) => {
      if (this.metadata.has(key)) throw new Error(`Setting metadata failed: ${key} is already set`);

      this.metadata.set(key, toByteArray(value));
    });

    if (this.metadata.size > 0) this.addUseClause('soroban_sdk', 'contractmeta');
  }
}
