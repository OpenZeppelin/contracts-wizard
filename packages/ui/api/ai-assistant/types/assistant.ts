import type { AllLanguageContractOptions, AllLanguageFunctionName, SupportedLanguage } from './languages.ts';

export type Chat = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AiAssistantContractOptions = Partial<AllLanguageContractOptions[keyof AllLanguageContractOptions]>;
export type AiAssistantFunctionName = AllLanguageFunctionName;
export type AiAssistantLanguage = SupportedLanguage;

export type AiChatBodyRequest = {
  messages: Chat[];
  language: AiAssistantLanguage;
  currentCode: string;
  currentOpts?: AiAssistantContractOptions;
  chatId: string;
};

export type AiFunctionCall = {
  name: AiAssistantFunctionName;
  arguments: AiAssistantContractOptions;
};

export type AiFunctionCallResponse = {
  function_call: {
    name: AiAssistantFunctionName;
    arguments: string;
  };
};
