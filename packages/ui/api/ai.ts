import * as solidityFunctions from './ai-assistant/function-definitions/solidity.ts';
import * as cairoFunctions from './ai-assistant/function-definitions/cairo.ts';
import * as cairoAlphaFunctions from './ai-assistant/function-definitions/cairo-alpha.ts';
import * as stellarFunctions from './ai-assistant/function-definitions/stellar.ts';
import * as stylusFunctions from './ai-assistant/function-definitions/stylus.ts';
import { saveChatInRedisIfDoesNotExist } from './services/redis.ts';
import { getOpenAiInstance } from './services/open-ai.ts';
import { getEnvironmentVariableOr } from './utils/env.ts';
import type { AiChatBodyRequest, Chat } from './ai-assistant/types/assistant.ts';
import type { SupportedLanguage } from './ai-assistant/types/languages.ts';
import type {
  AllContractsAIFunctionDefinitions,
  SimpleAiFunctionDefinition,
} from './ai-assistant/types/function-definition.ts';
import { Cors } from './utils/cors.ts';
import type { ChatCompletionStream, FunctionToolCallArgumentsDeltaEvent } from 'openai/lib/ChatCompletionStream.mjs';

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

const processOpenAIStream = (openAiStream: ChatCompletionStream, aiChatMessages: Chat[], chatId: string) =>
  new ReadableStream({
    async pull(controller: ReadableStreamDefaultController<Uint8Array>) {
      const textEncoder = new TextEncoder();
      let finalResponse = '';
      const finalToolCall: Pick<FunctionToolCallArgumentsDeltaEvent, 'arguments' | 'name'> = {
        name: '',
        arguments: '',
      };

      try {
        for await (const chunk of openAiStream) {
          const delta = chunk?.choices?.[0]?.delta;
          const isToolCallBuilding = Boolean(delta?.tool_calls);
          const isFunctionCallFinished = Boolean(chunk?.choices?.[0]?.finish_reason === 'tool_calls');

          if (delta.content) {
            finalResponse += delta.content;
            controller.enqueue(textEncoder.encode(delta.content));
          } else if (isToolCallBuilding) {
            finalToolCall.name += delta.tool_calls?.[0]?.function?.name || '';
            finalToolCall.arguments += delta.tool_calls?.[0]?.function?.arguments || '';
          } else if (isFunctionCallFinished)
            controller.enqueue(
              textEncoder.encode(
                JSON.stringify({
                  function_call: finalToolCall,
                }),
              ),
            );
        }

        controller.close();
      } catch (error) {
        console.error('OpenAI streaming error:', error);
        controller.error(error);
        return;
      } finally {
        await saveChatInRedisIfDoesNotExist(chatId, aiChatMessages)(finalResponse || JSON.stringify(finalToolCall));
      }
    },
  });

export default async (req: Request): Promise<Response> => {
  try {
    const aiChatBodyRequest: AiChatBodyRequest = await req.json();

    const openai = getOpenAiInstance();

    const aiChatMessages = buildAiChatMessages(aiChatBodyRequest);

    const openAiStream = openai.chat.completions.stream({
      model: getEnvironmentVariableOr('OPENAI_MODEL', 'gpt-4o-mini'),
      messages: aiChatMessages,
      tools: getFunctionsContext(aiChatBodyRequest.language),
      temperature: 0.7,
      stream: true,
    });

    return new Response(processOpenAIStream(openAiStream, aiChatMessages, aiChatBodyRequest.chatId), {
      headers: new Headers({
        ...Cors,
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
