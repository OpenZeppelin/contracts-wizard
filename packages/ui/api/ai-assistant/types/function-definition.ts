import type { AllLanguageContractOptions } from './languages.ts';

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
  TContract extends Partial<AllLanguageContractOptions[keyof AllLanguageContractOptions]>,
  TOmit extends keyof TContract = 'kind',
> = {
  type: 'object';
  description?: string;
  properties: Omit<AiFunctionProperties<Required<TContract>>, 'kind' | TOmit>;
};

export type AiFunctionDefinition<
  TContractName extends keyof AllLanguageContractOptions = keyof AllLanguageContractOptions,
  TOmit extends keyof AllLanguageContractOptions[TContractName] = 'kind',
> = {
  name: TContractName;
  description: string;
  parameters: AiFunctionPropertyDefinition<AllLanguageContractOptions[TContractName], TOmit> & {
    required?: string[];
    additionalProperties: false;
  };
};
