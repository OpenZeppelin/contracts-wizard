import type { AllLanguagesContractsOptions, LanguageContractsOptions, SupportedLanguage } from './languages.ts';

type IsPrimitiveUnion<T, U = T> = [T] extends [never]
  ? false // Edge case for `never`
  : [T] extends [boolean]
    ? false
    : T extends U
      ? [U] extends [T]
        ? false
        : true
      : false;

type AllRequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

type Permutation<T extends string | number | symbol, U extends string | number | symbol = T> = [T] extends [never]
  ? []
  : {
      [K in T]: [K, ...Permutation<Exclude<U, K>>];
    }[T];

type ExactRequiredKeys<T> = Permutation<AllRequiredKeys<T>>;

type UnionToIntersection<U> = (U extends unknown ? (x: U) => unknown : never) extends (x: infer I) => unknown
  ? I
  : never;

// Get the last member of a union
type LastOf<U> =
  UnionToIntersection<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void ? L : never;

// Convert a union to a tuple (order is not guaranteed)
type UnionToTuple<U, L = LastOf<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, L>>, L];

type AiFunctionCallPrimaryType<TType> = TType extends string
  ? 'string'
  : TType extends number
    ? 'number'
    : TType extends boolean
      ? 'boolean'
      : TType extends unknown[]
        ? 'array'
        : TType extends object
          ? 'object'
          : never;

type AiFunctionType<TType> = {
  type?: AiFunctionCallPrimaryType<TType>;
  enum?: UnionToTuple<TType>;
  description: string;
};

type PrimitiveKey<T> = T extends boolean
  ? 'boolean'
  : T extends string
    ? 'string'
    : T extends number
      ? 'number'
      : never;

type DistinctPrimitiveTypes<U> = U extends unknown ? PrimitiveKey<U> : never;

type MembersOf<U, K extends string> = Extract<
  U,
  K extends 'boolean' ? boolean : K extends 'string' ? string : K extends 'number' ? number : never
>;
type AnyOf<U> = UnionToTuple<
  {
    [K in DistinctPrimitiveTypes<U>]: {
      type: K;
      enum: UnionToTuple<MembersOf<U, K>>;
    };
  }[DistinctPrimitiveTypes<U>]
>;

type AiFunctionCallOneOfType<TType> =
  | Required<AiFunctionType<TType>>
  | {
      anyOf: AnyOf<TType>;
      description: string;
    };

export type AiFunctionCallType<TType> = AiFunctionType<TType> | AiFunctionCallOneOfType<TType>;

export type AiFunctionProperties<TProperties extends object> = Required<{
  [K in keyof TProperties]: TProperties[K] extends object
    ? AiFunctionPropertyDefinition<TProperties[K]>
    : IsPrimitiveUnion<TProperties[K]> extends true
      ? AiFunctionCallOneOfType<TProperties[K]>
      : AiFunctionType<TProperties[K]>;
}>;

export type AiFunctionPropertyDefinition<
  TContract extends Partial<AllLanguagesContractsOptions[keyof AllLanguagesContractsOptions]>,
  TOmit extends keyof TContract = 'kind',
> = {
  type: 'object';
  description?: string;
  properties: Omit<AiFunctionProperties<Required<TContract>>, 'kind' | TOmit>;
};

export type AiFunctionDefinition<
  TLanguage extends SupportedLanguage = SupportedLanguage,
  TContractName extends keyof LanguageContractsOptions<TLanguage> = keyof LanguageContractsOptions<TLanguage>,
  TOmit extends keyof Required<LanguageContractsOptions<TLanguage>[TContractName]> = 'kind' extends keyof Required<
    LanguageContractsOptions<TLanguage>[TContractName]
  >
    ? 'kind'
    : never,
> = {
  name: TContractName;
  description: string;
  parameters: AiFunctionPropertyDefinition<Required<LanguageContractsOptions<TLanguage>[TContractName]>, TOmit> & {
    required?: ExactRequiredKeys<Omit<LanguageContractsOptions<TLanguage>[TContractName], 'kind' | TOmit>>;
    additionalProperties: false;
  };
};

export type SimpleAiFunctionDefinition = {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    description?: string;
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties: false;
  };
};
