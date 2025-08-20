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
import type { ChatCompletionChunk } from 'openai/resources/chat/index.mjs';
import type { Stream } from 'openai/streaming.mjs';

const getFunctionsContext = <TLanguage extends SupportedLanguage = SupportedLanguage>(
  language: TLanguage,
): SimpleAiFunctionDefinition[] => {
  const functionPerLanguages: AllContractsAIFunctionDefinitions = {
    solidity: solidityFunctions,
    cairo: cairoFunctions,
    cairoAlpha: cairoAlphaFunctions,
    stellar: stellarFunctions,
    stylus: stylusFunctions,
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

const processOpenAIStream = (openAiStream: Stream<ChatCompletionChunk>, aiChatMessages: Chat[], chatId: string) =>
  new ReadableStream({
    async pull(controller: ReadableStreamDefaultController<Uint8Array>) {
      const textEncoder = new TextEncoder();
      let finalResponse = '';
      const finalFunctionCall = { name: '', arguments: '' };

      try {
        for await (const chunk of openAiStream) {
          const delta = chunk?.choices?.[0]?.delta;
          const isFunctionCallBuilding = Boolean(delta?.function_call);
          const isFunctionCallFinished = Boolean(chunk?.choices?.[0]?.finish_reason === 'function_call');

          if (delta.content) {
            finalResponse += delta.content;
            controller.enqueue(textEncoder.encode(delta.content));
          } else if (isFunctionCallBuilding) {
            finalFunctionCall.name += delta.function_call?.name || '';
            finalFunctionCall.arguments += delta.function_call?.arguments || '';
          } else if (isFunctionCallFinished)
            controller.enqueue(
              textEncoder.encode(
                JSON.stringify({
                  function_call: finalFunctionCall,
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
        await saveChatInRedisIfDoesNotExist(chatId, aiChatMessages)(finalResponse || JSON.stringify(finalFunctionCall));
      }
    },
  });

export default async (req: Request): Promise<Response> => {
  try {
    const aiChatBodyRequest: AiChatBodyRequest = await req.json();

    const openai = getOpenAiInstance();

    const aiChatMessages = buildAiChatMessages(aiChatBodyRequest);

    const openAiStream = await openai.chat.completions.create({
      model: getEnvironmentVariableOr('OPENAI_MODEL', 'gpt-4o-mini'),
      messages: aiChatMessages,
      functions: getFunctionsContext(aiChatBodyRequest.language),
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
