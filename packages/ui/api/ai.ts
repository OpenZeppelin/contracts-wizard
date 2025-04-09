import { OpenAIStream } from 'ai';
import * as solidityFunctions from './ai-assistant/function-definitions/solidity.ts';
import { saveChatInRedisIfDoesNotExist } from './services/redis.ts';
import { getOpenAiInstance } from './services/open-ai.ts';
import { getEnvironmentVariableOr } from './utils/env.ts';
import type { AiChatBodyRequest, Chat } from './ai-assistant/types/assistant.ts';
import type { SupportedLanguage } from './ai-assistant/types/languages.ts';
import type {
  AllContractsAIFunctionDefinitions,
  SimpleAiFunctionDefinition,
} from './ai-assistant/types/function-definition.ts';

const getFunctionsContext = <TLanguage extends SupportedLanguage = SupportedLanguage>(
  language: TLanguage,
): SimpleAiFunctionDefinition[] => {
  const functionPerLanguages: AllContractsAIFunctionDefinitions = {
    solidity: solidityFunctions,
  };

  return Object.values(functionPerLanguages[language] ?? {});
};

const buildAiChatMessages = (request: AiChatBodyRequest): Chat[] => {
  const validatedMessages = request.messages.filter((message: { role: string; content: string }) => {
    return message.content.length < 500;
  });

  return [
    {
      role: 'system',
      content: `
      You are a smart contract assistant built by OpenZeppelin to help users using OpenZeppelin Contracts Wizard.
      The current options are ${JSON.stringify(request.currentOpts)}.
      The current contract code is ${request.currentCode}, written in ${request.language}
      Please be kind and concise. Keep responses to <100 words.
    `.trim(),
    },
    ...validatedMessages,
  ];
};

export default async (req: Request): Promise<Response> => {
  try {
    const aiChatBodyRequest: AiChatBodyRequest = await req.json();

    const openai = getOpenAiInstance();

    const aiChatMessages = buildAiChatMessages(aiChatBodyRequest);

    const response = await openai.chat.completions.create({
      model: getEnvironmentVariableOr('OPENAI_MODEL', 'gpt-4o-mini'),
      messages: aiChatMessages,
      functions: getFunctionsContext(aiChatBodyRequest.language),
      temperature: 0.7,
      stream: true,
    });

    const stream = OpenAIStream(response, {
      onCompletion: saveChatInRedisIfDoesNotExist(aiChatBodyRequest.chatId, aiChatMessages),
    });

    return new Response(stream, {
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'text/html; charset=utf-8',
      }),
    });
  } catch (e) {
    console.error('Could not retrieve results:', e);
    return Response.json({
      error: 'Could not retrieve results.',
    });
  }
};
