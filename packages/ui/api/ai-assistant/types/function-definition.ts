import type { AllLanguageContractOptions } from './languages.ts';

type AiFunctionType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';

type AiFunctionCallPrimaryType = {
  type?: AiFunctionType;
  enum?: string[] | number[] | boolean[];
};

type AiFunctionCallOneOfType = {
  anyOf?: AiFunctionCallType[];
};

export type AiFunctionCallType = (AiFunctionCallPrimaryType | AiFunctionCallOneOfType) & { description?: string };

type NestedProperty<
  TContract extends Partial<AllLanguageContractOptions[keyof AllLanguageContractOptions]>,
  TNestedKey extends keyof TContract,
  TOmit extends keyof TContract,
> = AiFunctionPropertyDefinition<TContract, TOmit> & {
  properties: {
    [K in keyof TContract[TNestedKey]]: AiFunctionCallType;
  };
};

export type AiFunctionPropertyDefinition<
  TContract extends Partial<AllLanguageContractOptions[keyof AllLanguageContractOptions]>,
  TOmit extends keyof TContract = 'kind',
> = AiFunctionCallType & {
  properties?: Required<
    Omit<
      {
        [K in keyof TContract]: TContract[K] extends object
          ? NestedProperty<TContract, K, TOmit>
          : AiFunctionPropertyDefinition<TContract, TOmit>;
      },
      'kind' | TOmit
    >
  >;
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
