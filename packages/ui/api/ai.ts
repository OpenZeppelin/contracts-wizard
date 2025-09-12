import * as solidityFunctions from './ai-assistant/function-definitions/solidity.ts';
import * as cairoFunctions from './ai-assistant/function-definitions/cairo.ts';
import * as cairoAlphaFunctions from './ai-assistant/function-definitions/cairo-alpha.ts';
import * as stellarFunctions from './ai-assistant/function-definitions/stellar.ts';
import * as stylusFunctions from './ai-assistant/function-definitions/stylus.ts';
import { saveChatInRedisIfDoesNotExist } from './services/redis.ts';
import type { ChatMessages } from './services/open-ai.ts';
import { createOpenAiCompletionStream } from './services/open-ai.ts';
import type { AiChatBodyRequest } from './ai-assistant/types/assistant.ts';
import type { SupportedLanguage } from './ai-assistant/types/languages.ts';
import type {
  AllContractsAIFunctionDefinitions,
  SimpleAiFunctionDefinition,
} from './ai-assistant/types/function-definition.ts';
import { Cors } from './utils/cors.ts';

const getFunctionsContext = <TLanguage extends SupportedLanguage = SupportedLanguage>(
  language: TLanguage,
): { type: 'function'; function: SimpleAiFunctionDefinition }[] => {
  const functionPerLanguages: AllContractsAIFunctionDefinitions = {
    solidity: solidityFunctions,
    cairo: cairoFunctions,
    cairoAlpha: cairoAlphaFunctions,
    stellar: stellarFunctions,
    stylus: stylusFunctions,
  };

  return (Object.values(functionPerLanguages[language] ?? {}) as SimpleAiFunctionDefinition[]).map(
    functionDefinition => ({
      type: 'function',
      function: functionDefinition,
    }),
  );
};

const buildAiChatMessagess = (request: AiChatBodyRequest): ChatMessages => {
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

    const ChatMessagess = buildAiChatMessagess(aiChatBodyRequest);

    const openAiStream = createOpenAiCompletionStream({
      streamParams: {
        messages: ChatMessagess,
        tools: getFunctionsContext(aiChatBodyRequest.language),
      },
      chatId: aiChatBodyRequest.chatId,
      onAiStreamCompletion: async ({ chatId, ChatMessagess }, finalStreamResult) =>
        finalStreamResult && (await saveChatInRedisIfDoesNotExist(chatId, ChatMessagess)(finalStreamResult)),
    });

    return new Response(openAiStream, {
      headers: new Headers({
        ...Cors,
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-transform',
      }),
    });
  } catch (e) {
    console.error('Could not retrieve results:', e);
    return Response.json({
      error: 'Could not retrieve results.',
    });
  }
};
