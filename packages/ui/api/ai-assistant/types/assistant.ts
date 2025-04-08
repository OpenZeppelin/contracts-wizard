import type {
  LanguageContractsOptions,
  LanguageContractsNames,
  SupportedLanguage,
  AllLanguageContractsNames,
  AllLanguagesContractsOptions,
} from './languages';

export type Chat = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AiAssistantContractsOptions<TLanguage extends SupportedLanguage = never> = [TLanguage] extends [never]
  ? Partial<AllLanguagesContractsOptions>
  : Required<LanguageContractsOptions<TLanguage>[keyof LanguageContractsOptions<TLanguage>]>;

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
