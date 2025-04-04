import type { ExactRequiredKeys, IsPrimitiveUnion, UnionToTuple } from './helpers.ts';
import type { AllLanguagesContractsOptions, LanguageContractsOptions, SupportedLanguage } from './languages.ts';

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

type DistinctPrimitiveTypes<U> = U extends unknown ? AiFunctionCallPrimaryType<U> : never;

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
