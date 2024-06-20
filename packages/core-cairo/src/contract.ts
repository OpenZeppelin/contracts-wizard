import { toIdentifier } from './utils/convert-strings';

export interface Contract {
  license: string;
  name: string;
  standaloneImports: string[];
  components: Component[];
  constructorCode: string[];
  constructorArgs: Argument[];
  upgradeable: boolean; 
  implementedTraits: ImplementedTrait[];
  superVariables: Variable[];
}

export type Value = string | number | { lit: string } | { note: string, value: Value };

export interface Component {
  name: string;
  path: string;
  substorage: Substorage;
  event: Event;
  impls: Impl[];
  internalImpl?: Impl;
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
}

export interface Initializer {
  params: Value[];
}

export interface BaseImplementedTrait {
  name: string;
  of: string;
  tags: string[];
  perItemTag?: string;
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
}

export interface Argument {
  name: string;
  type?: string;
}

export class ContractBuilder implements Contract {
  readonly name: string;
  license: string = 'MIT';
  upgradeable = false;

  readonly constructorArgs: Argument[] = [];
  readonly constructorCode: string[] = [];

  private componentsMap: Map<string, Component> = new Map<string, Component>();
  private implementedTraitsMap: Map<string, ImplementedTrait> = new Map<string, ImplementedTrait>();
  private superVariablesMap: Map<string, Variable> = new Map<string, Variable>();
  private standaloneImportsSet: Set<string> = new Set();
  private interfaceFlagsSet: Set<string> = new Set();

  constructor(name: string) {
    this.name = toIdentifier(name, true);
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

  get standaloneImports(): string[] {
    return [...this.standaloneImportsSet];
  }

  /**
   * Custom flags to denote that the contract implements a specific interface, e.g. ISRC5, to avoid duplicates
   **/
  get interfaceFlags(): Set<string> {
    return this.interfaceFlagsSet;
  }

  addStandaloneImport(fullyQualified: string) {
    this.standaloneImportsSet.add(fullyQualified);
  }

  addComponent(component: Component, params: Value[] = [], initializable: boolean = true): boolean {
    const key = component.name;
    const present = this.componentsMap.has(key);
    if (!present) {
      const initializer = initializable ? { params } : undefined;
      const cp: Component = { initializer, ...component, impls: [ ...component.impls ] }; // spread impls to deep copy from original component
      this.componentsMap.set(key, cp);
    }
    return !present;
  }

  addImplToComponent(component: Component, impl: Impl) {
    this.addComponent(component);
    let c = this.componentsMap.get(component.name);
    if (c == undefined) {
      throw new Error(`Component ${component.name} has not been added yet`);
    }

    if (!c.impls.some(i => i.name === impl.name)) {
      c.impls.push(impl);
    }
  }

  addSuperVariable(variable: Variable) {
    if (this.superVariablesMap.has(variable.name)) {
      return false;
    } else {
      this.superVariablesMap.set(variable.name, variable);
      return true;
    }
  }

  addImplementedTrait(baseTrait: BaseImplementedTrait) {
    const key = baseTrait.name;
    const existingTrait = this.implementedTraitsMap.get(key);
    if (existingTrait !== undefined) {
      return existingTrait;
    } else {
      const t: ImplementedTrait = { 
        name: baseTrait.name,
        of: baseTrait.of,
        tags: [ ...baseTrait.tags ],
        functions: [],
        priority: baseTrait.priority,
      };
      this.implementedTraitsMap.set(key, t);
      return t;
    }
  }

  addFunction(baseTrait: BaseImplementedTrait, fn: BaseFunction) {
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

  private getFunctionSignature(fn: BaseFunction) {
    return [fn.name, '(', ...fn.args.map(a => a.name), ')'].join('');
  }

  addFunctionCodeBefore(baseTrait: BaseImplementedTrait, fn: BaseFunction, codeBefore: string) {
    this.addImplementedTrait(baseTrait);
    const existingFn = this.addFunction(baseTrait, fn);
    existingFn.codeBefore = [ ...existingFn.codeBefore ?? [], codeBefore ];
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
    this.constructorCode.push(code);
  }

  addInterfaceFlag(flag: string) {
    this.interfaceFlagsSet.add(flag);
  }
}
