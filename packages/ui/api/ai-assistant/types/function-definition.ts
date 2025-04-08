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
  enum?: TType[];
  description: string;
};

type AiFunctionCallOneOfType<TType> =
  | Required<AiFunctionType<TType>>
  | {
      anyOf: Omit<AiFunctionCallType<TType>, 'description'>[];
      description: string;
    };

export type AiFunctionCallType<TType> = AiFunctionType<TType> | AiFunctionCallOneOfType<TType>;

type AiFunctionProperties<TProperties extends object> = Required<{
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
    required?: (keyof LanguageContractsOptions<TLanguage>[TContractName])[];
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
