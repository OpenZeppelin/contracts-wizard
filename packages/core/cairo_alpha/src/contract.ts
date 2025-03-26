import { toIdentifier } from './utils/convert-strings';

export interface Contract {
  license: string;
  name: string;
  account: boolean;
  useClauses: UseClause[];
  components: Component[];
  constants: Variable[];
  constructorCode: string[];
  constructorArgs: Argument[];
  upgradeable: boolean;
  implementedTraits: ImplementedTrait[];
  superVariables: Variable[];
}

export type Value = string | number | bigint | { lit: string } | { note: string; value: Value };

export interface UseClause {
  containerPath: string;
  name: string;
  groupable?: boolean;
  alias?: string;
}

export interface Component {
  name: string;
  path: string;
  substorage: Substorage;
  event: Event;
  impls: Impl[];
  initializer?: Initializer;
}

export interface Substorage {
  name: string;
  type: string;
}

export interface Event {
  name: string;
  type: string;
}

export interface Impl {
  name: string;
  value: string;
  embed?: boolean;
  section?: string;
}

export interface Initializer {
  params: Value[];
}

export interface BaseImplementedTrait {
  name: string;
  of: string;
  tags: string[];
  perItemTag?: string;
  section?: string;
  /**
   * Priority for which trait to print first.
   * Lower numbers are higher priority, undefined is lowest priority.
   */
  priority?: number;
}

export interface ImplementedTrait extends BaseImplementedTrait {
  superVariables: Variable[];
  functions: ContractFunction[];
  section?: string;
}

export interface BaseFunction {
  name: string;
  args: Argument[];
  code: string[];
  returns?: string;
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
  readonly account: boolean;
  license = 'MIT';
  upgradeable = false;

  readonly constructorArgs: Argument[] = [];
  readonly constructorCode: string[] = [];

  private componentsMap: Map<string, Component> = new Map();
  private implementedTraitsMap: Map<string, ImplementedTrait> = new Map();
  private superVariablesMap: Map<string, Variable> = new Map();
  private constantsMap: Map<string, Variable> = new Map();
  private useClausesMap: Map<string, UseClause> = new Map();
  private interfaceFlagsSet: Set<string> = new Set();

  constructor(name: string, account: boolean = false) {
    this.name = toIdentifier(name, true);
    this.account = account;
  }

  get components(): Component[] {
    return [...this.componentsMap.values()];
  }

  get implementedTraits(): ImplementedTrait[] {
    return [...this.implementedTraitsMap.values()];
  }

  get superVariables(): Variable[] {
    return [...this.superVariablesMap.values()];
  }

  get constants(): Variable[] {
    return [...this.constantsMap.values()];
  }

  get useClauses(): UseClause[] {
    return [...this.useClausesMap.values()];
  }

  /**
   * Custom flags to denote that the contract implements a specific interface, e.g. ISRC5, to avoid duplicates
   **/
  get interfaceFlags(): Set<string> {
    return this.interfaceFlagsSet;
  }

  addUseClause(containerPath: string, name: string, options?: { groupable?: boolean; alias?: string }): void {
    // groupable defaults to true
    const groupable = options?.groupable ?? true;
    const alias = options?.alias ?? '';
    const uniqueName = alias.length > 0 ? alias : name;
    const present = this.useClausesMap.has(uniqueName);
    if (!present) {
      this.useClausesMap.set(uniqueName, {
        containerPath,
        name,
        groupable,
        alias,
      });
    }
  }

  addComponent(component: Component, params: Value[] = [], initializable: boolean = true): boolean {
    this.addUseClause(component.path, component.name);
    const key = component.name;
    const present = this.componentsMap.has(key);
    if (!present) {
      const initializer = initializable ? { params } : undefined;
      const cp: Component = {
        initializer,
        ...component,
        impls: [...component.impls],
      }; // spread impls to deep copy from original component
      this.componentsMap.set(key, cp);
    }
    return !present;
  }

  addImplToComponent(component: Component, impl: Impl): void {
    this.addComponent(component);
    const c = this.componentsMap.get(component.name);
    if (c == undefined) {
      throw new Error(`Component ${component.name} has not been added yet`);
    }

    if (!c.impls.some(i => i.name === impl.name)) {
      c.impls.push(impl);
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

  addSuperVariable(variable: Variable): boolean {
    if (this.superVariablesMap.has(variable.name)) {
      return false;
    } else {
      this.superVariablesMap.set(variable.name, variable);
      this.addUseClause('super', variable.name);
      return true;
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
        of: baseTrait.of,
        tags: [...baseTrait.tags],
        superVariables: [],
        functions: [],
        section: baseTrait.section,
        priority: baseTrait.priority,
      };
      this.implementedTraitsMap.set(key, t);
      return t;
    }
  }

  addSuperVariableToTrait(baseTrait: BaseImplementedTrait, newVar: Variable): boolean {
    const trait = this.addImplementedTrait(baseTrait);
    for (const existingVar of trait.superVariables) {
      if (existingVar.name === newVar.name) {
        if (existingVar.type !== newVar.type) {
          throw new Error(
            `Tried to add duplicate super var ${newVar.name} with different type: ${newVar.type} instead of ${existingVar.type}.`,
          );
        }
        if (existingVar.value !== newVar.value) {
          throw new Error(
            `Tried to add duplicate super var ${newVar.name} with different value: ${newVar.value} instead of ${existingVar.value}.`,
          );
        }
        return false; // No need to add, already exists
      }
    }
    trait.superVariables.push(newVar);
    return true;
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
      tag: baseTrait.perItemTag,
    };
    t.functions.push(contractFn);
    return contractFn;
  }

  private getFunctionSignature(fn: BaseFunction): string {
    return [fn.name, '(', ...fn.args.map(a => a.name), ')'].join('');
  }

  addFunctionCodeBefore(baseTrait: BaseImplementedTrait, fn: BaseFunction, codeBefore: string): void {
    this.addImplementedTrait(baseTrait);
    const existingFn = this.addFunction(baseTrait, fn);
    existingFn.codeBefore = [...(existingFn.codeBefore ?? []), codeBefore];
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
    this.constructorCode.push(code);
  }

  addInterfaceFlag(flag: string): void {
    this.interfaceFlagsSet.add(flag);
  }
}
