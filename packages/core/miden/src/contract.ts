import { toIdentifier, toSnakeCase } from './utils/convert-strings';
import type { Lines } from './utils/format-lines';

export interface Name {
  /** PascalCase identifier of the struct representing the account. */
  identifier: string;
  /** snake_case identifier suitable as a module or file name. */
  moduleName: string;
}

export interface Contract {
  license: string;
  securityContact: string;
  name: Name;
  useClauses: UseClause[];
  constants: Constant[];
  functions: ContractFunction[];
}

export interface UseClause {
  containerPath: string;
  name: string;
  alias?: string;
}

export interface Constant {
  name: string;
  type: string;
  value: string;
  /** Doc comment lines, without the leading `///`. */
  comments: string[];
}

export interface Argument {
  name: string;
  type: string;
}

export interface ContractFunction {
  name: string;
  /** Doc comment lines, without the leading `///`. */
  comments: string[];
  args: Argument[];
  returns?: string;
  /** Body of the function. Nested arrays are indented one level deeper. */
  code: Lines[];
  pub: boolean;
}

export class ContractBuilder implements Contract {
  readonly name: Name;
  license = 'MIT';
  securityContact = '';

  private useClausesMap: Map<string, UseClause> = new Map();
  private constantsMap: Map<string, Constant> = new Map();
  private functionsMap: Map<string, ContractFunction> = new Map();

  constructor(name: string) {
    this.name = {
      identifier: toIdentifier(name, true),
      moduleName: toSnakeCase(name),
    };
  }

  get useClauses(): UseClause[] {
    return [...this.useClausesMap.values()];
  }

  get constants(): Constant[] {
    return [...this.constantsMap.values()];
  }

  get functions(): ContractFunction[] {
    return [...this.functionsMap.values()];
  }

  addUseClause(containerPath: string, name: string, alias?: string): void {
    const key = `${containerPath}::${name}${alias ? ` as ${alias}` : ''}`;
    if (!this.useClausesMap.has(key)) {
      this.useClausesMap.set(key, { containerPath, name, alias });
    }
  }

  /**
   * Adds an associated constant. Returns `false` if a constant with the same name was already added.
   */
  addConstant(constant: Constant): boolean {
    if (this.constantsMap.has(constant.name)) {
      return false;
    } else {
      this.constantsMap.set(constant.name, { ...constant, comments: [...constant.comments] });
      return true;
    }
  }

  /**
   * Adds an associated function. If a function with the same name was already added, returns the existing one.
   */
  addFunction(fn: ContractFunction): ContractFunction {
    const existing = this.functionsMap.get(fn.name);
    if (existing !== undefined) {
      return existing;
    }
    const added: ContractFunction = { ...fn, comments: [...fn.comments], args: [...fn.args], code: [...fn.code] };
    this.functionsMap.set(fn.name, added);
    return added;
  }

  addSecurityTag(securityContact: string): void {
    this.securityContact = securityContact;
  }
}
