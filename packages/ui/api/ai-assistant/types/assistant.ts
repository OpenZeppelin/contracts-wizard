import type {
  LanguageContractsNames,
  SupportedLanguage,
  AllLanguageContractsNames,
  AllLanguageContractOptionValues,
  LanguageContractOptionValues,
} from './languages.ts';

type DistributivePartial<T> = T extends unknown ? Partial<T> : never;

export type Chat = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AiAssistantContractsOptions<TLanguage extends SupportedLanguage = never> = [TLanguage] extends [never]
  ? DistributivePartial<AllLanguageContractOptionValues>
  : DistributivePartial<LanguageContractOptionValues<TLanguage>>;

export type AiAssistantFunctionName<TLanguage extends SupportedLanguage = never> = [TLanguage] extends [never]
  ? AllLanguageContractsNames
  : LanguageContractsNames<TLanguage>;

export type AiAssistantLanguage = SupportedLanguage;

export type AiChatBodyRequest = {
  messages: Chat[];
  language: AiAssistantLanguage;
  currentCode: string;
  currentOpts?: AiAssistantContractsOptions;
  chatId: string;
};

export type AiFunctionCall<TLanguage extends SupportedLanguage = never> = {
  name: AiAssistantFunctionName<TLanguage>;
  arguments: AiAssistantContractsOptions<TLanguage>;
};

export type AiFunctionCallResponse = {
  function_call: {
    name: AiAssistantFunctionName;
    arguments: string;
  };
};
