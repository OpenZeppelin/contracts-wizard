import type { AiFunctionCallAnyOf, StringifyPrimaryType, ExactRequiredKeys, EnumValues } from './helpers.ts';
import { exactRequiredKeys } from './helpers.ts';
import type { LanguageContractsNames, LanguageContractsOptions, SupportedLanguage } from './languages.ts';

type AiFunctionType<TType> = {
  type?: StringifyPrimaryType<TType>;
  enum?: EnumValues<TType>;
  description: string;
};

type AiFunctionCallOneOfType<TType> =
  | Required<AiFunctionType<TType>>
  | {
      anyOf: AiFunctionCallAnyOf<TType>;
      description: string;
    };

export type AiFunctionCallType<TType> = AiFunctionType<TType> | AiFunctionCallOneOfType<TType>;

export type AiFunctionProperties<TProperties extends object> = Required<{
  [K in keyof TProperties]: TProperties[K] extends object
    ? AiFunctionPropertyDefinition<TProperties[K]>
    : AiFunctionCallType<TProperties[K]>;
}>;

export type AiFunctionPropertyDefinition<TContract extends object, TOmit extends keyof TContract | 'kind' = 'kind'> = {
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

type ContractOptions<
  TLanguage extends SupportedLanguage,
  TContractName extends keyof LanguageContractsOptions<TLanguage>,
> = LanguageContractsOptions<TLanguage>[TContractName];

type DefaultOmit<T> = 'kind' extends keyof Required<T> ? 'kind' : never;

export const contractExactRequiredKeys = <
  TLanguage extends SupportedLanguage,
  TContractName extends keyof LanguageContractsOptions<TLanguage>,
  TOmit extends keyof Required<ContractOptions<TLanguage, TContractName>> = DefaultOmit<
    ContractOptions<TLanguage, TContractName>
  >,
>() => exactRequiredKeys<Omit<ContractOptions<TLanguage, TContractName>, 'kind' | TOmit>>();

export type SimpleAiFunctionDefinition = {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    description?: string;
    properties: Record<string, unknown>;
    required?: readonly string[];
    additionalProperties: false;
  };
};

export type AllContractsAIFunctionDefinitions = {
  [L in SupportedLanguage]: {
    [K in LanguageContractsNames<L> as `${L}${K}AIFunctionDefinition`]: { name: K } & SimpleAiFunctionDefinition;
  };
};
