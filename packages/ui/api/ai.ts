import { OpenAIStream } from 'https://esm.sh/ai@2.2.16';
import {
  erc20Function,
  erc721Function,
  erc1155Function,
  stablecoinFunction,
  realWorldAssetFunction,
  governorFunction,
  customFunction,
} from '../src/solidity/wiz-functions.ts';
import { getRedisInstance } from './services/redis.ts';
import { getOpenAiInstance } from './services/open-ai.ts';
import { getEnvironmentVariableOr } from './utils/env.ts';
import type { Chat } from '../src/types.ts';

type AiChatBodyRequest = {
  messages: Chat[];
  currentCode: string;
  currentOpts: Record<string, Record<string, string | boolean>>;
  chatId: string;
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
      The current contract code is ${request.currentCode}
      Please be kind and concise. Keep responses to <100 words.
    `.trim(),
    },
    ...validatedMessages,
  ];
};

export default async (req: Request): Promise<Response> => {
  try {
    const aiChatBodyRequest: AiChatBodyRequest = await req.json();

    const redis = getRedisInstance();
    const openai = getOpenAiInstance();

    const aiChatMessages = buildAiChatMessages(aiChatBodyRequest);

    const response = await openai.chat.completions.create({
      model: getEnvironmentVariableOr('OPEN_AI_MODEL', 'gpt-4o-mini'),
      messages: aiChatMessages,
      functions: [
        erc20Function,
        erc721Function,
        erc1155Function,
        stablecoinFunction,
        realWorldAssetFunction,
        governorFunction,
        customFunction,
      ],
      temperature: 0.7,
      stream: true,
    });

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        const id = aiChatBodyRequest.chatId;
        const updatedAt = Date.now();
        const payload = {
          id,
          updatedAt,
          messages: [
            ...aiChatMessages,
            {
              content: completion,
              role: 'assistant',
            },
          ],
        };
        const exists = await redis.exists(`chat:${id}`);
        if (!exists) {
          // @ts-expect-error redis types seem to require [key: string]
          payload.createdAt = updatedAt;
        }
        await redis.hset(`chat:${id}`, payload);
      },
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
