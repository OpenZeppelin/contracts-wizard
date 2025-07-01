import { escapeString, toIdentifier } from './utils/convert-strings';
import { copy } from './utils/copy';

type Name = {
  identifier: string;
  stringLiteral: string;
};

export type TraitName = string;

export interface SolError {
  variant: string;
  value: { module: string; error: string };
}

export interface Contract {
  license: string;
  securityContact: string;
  name: Name;
  documentations: string[];
  useClauses: UseClause[];
  implementedTraits: ContractTrait[];
  constants: Variable[];
  eip712Needed?: boolean;
  functions: ContractFunction[];
}

export interface Implementation {
  name: string;
  type: string;
  genericType?: string;
}

export interface UseClause {
  containerPath: string;
  name: string;
  groupable?: boolean;
  alias?: string;
}

export type NonEmptyArray<T> = [T, ...T[]];

export type ContractTrait = {
  name: TraitName;
  /**
   * Priority for which trait to print first.
   * Lower numbers are higher priority, undefined is lowest priority.
   */
  priority?: number;
  modulePath: string;
  functions: ContractFunction[];
  requiredImports?: UseClause[];
} & ({
  associatedError: true;
  errors: NonEmptyArray<SolError> | { list: NonEmptyArray<SolError>; wraps: TraitName };
} | {
  associatedError?: boolean;
});

export type StoredContractTrait = ContractTrait & {
  storage: Implementation;
};

export interface Result {
  ok: string;
  err: 'Self::Error';
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
  securityContact = '';

  readonly documentations: string[] = [];

  private implementedTraitsMap: Map<string, ContractTrait> = new Map();
  private useClausesMap: Map<string, UseClause> = new Map();
  private constantsMap: Map<string, Variable> = new Map();
  private functionsArr: ContractFunction[] = [];

  error?: string | TraitName[];
  eip712Needed?: boolean;

  constructor(name: string) {
    this.name = {
      identifier: toIdentifier(name, true),
      stringLiteral: escapeString(name),
    };
    this.addUseClause({ containerPath: 'stylus_sdk::prelude', name: '*' });
  }

  get implementedTraits(): ContractTrait[] {
    return [...this.implementedTraitsMap.values()];
  }

  get useClauses(): UseClause[] {
    return [...this.useClausesMap.values()];
  }

  get constants(): Variable[] {
    return [...this.constantsMap.values()];
  }

  get functions(): ContractFunction[] {
    return [...this.functionsArr];
  }

  addUseClause({ containerPath, name, groupable, alias }: UseClause): void {
    // groupable defaults to true
    groupable ??= true;
    alias ??= '';

    const uniqueName = name === 'self'
      ? `${containerPath}::${name}`
      : alias.length > 0 ? alias : name;

    const present = this.useClausesMap.has(uniqueName);
    if (!present) {
      this.useClausesMap.set(uniqueName, { containerPath, name, groupable, alias });
    }
  }

  addImplementedTrait(trait: ContractTrait): ContractTrait {
    const key = trait.name;
    const existingTrait = this.implementedTraitsMap.get(key);
    if (existingTrait !== undefined) {
      return existingTrait;
    } else {
      const t: ContractTrait = copy(trait);
      this.implementedTraitsMap.set(key, t);
      if (isStoredContractTrait(t)) {
        this.addUseClause({ containerPath: t.modulePath, name: t.storage.type });
      }
      this.addUseClause({ containerPath: t.modulePath, name: t.name });
      if ('errors' in t) {
        this.addUseClause({ containerPath: t.modulePath, name: 'self' });
      }
      for (const useClause of t.requiredImports ?? []) {
        this.addUseClause({ ...useClause });
      }

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
    this.addUseClause({ containerPath: 'openzeppelin_stylus::utils::cryptography', name: 'eip712::IEip712' });
    this.eip712Needed = true;
  }

  traitExists(name: string): boolean {
    return this.implementedTraitsMap.has(name);
  }

  addFunction(fn: BaseFunction, trait?: ContractTrait): ContractFunction {
    const t = trait ? this.addImplementedTrait(trait) : this;

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

  setFunctionCode(fn: BaseFunction, code: string, trait?: ContractTrait): void {
    const existingFn = this.addFunction(fn, trait);
    existingFn.code = code;
  }

  addFunctionCodeBefore(fn: BaseFunction, codeBefore: string[], trait?: ContractTrait): void {
    const existingFn = this.addFunction(fn, trait);
    existingFn.codeBefore = [...(existingFn.codeBefore ?? []), ...codeBefore];
  }

  addFunctionCodeAfter(fn: BaseFunction, codeAfter: string[], trait?: ContractTrait): void {
    const existingFn = this.addFunction(fn, trait);
    existingFn.codeAfter = [...(existingFn.codeAfter ?? []), ...codeAfter];
  }

  addFunctionAttribute(fn: BaseFunction, attribute: string, trait?: ContractTrait): void {
    const existingFn = this.addFunction(fn, trait);
    existingFn.attribute = attribute;
  }

  addDocumentation(description: string) {
    this.documentations.push(description);
  }

  addSecurityTag(securityContact: string) {
    this.securityContact = securityContact;
  }
}

export function isStoredContractTrait(trait: ContractTrait): trait is StoredContractTrait {
  return 'storage' in trait;
}
