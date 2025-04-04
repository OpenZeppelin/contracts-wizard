import { Redis } from 'https://esm.sh/@upstash/redis@1.25.1';
import RedisMock from './dev-mocks/redis.ts';
import { getEnvironmentVariableOr, getEnvironmentVariablesOrFail } from '../utils/env.ts';
import type { Chat } from '../ai-assistant/types/assistant.ts';

type RedisChat = {
  id: string;
  messages: Chat[];
  updatedAt: number;
  createdAt?: number;
};

export const getRedisInstance = () => {
  if (getEnvironmentVariableOr('ENV', 'production') === 'dev') return new RedisMock();

  const { REDIS_URL, REDIS_TOKEN } = getEnvironmentVariablesOrFail(['REDIS_URL', 'REDIS_TOKEN']);

  return new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  });
};

export const saveChatInRedisIfDoesNotExist = (chatId: string, chatMessages: Chat[]) => async (completion: string) => {
  const redis = getRedisInstance();

  const updatedAt = Date.now();
  const payload: RedisChat = {
    id: chatId,
    updatedAt,
    messages: [
      ...chatMessages,
      {
        content: completion,
        role: 'assistant',
      },
    ],
  };

  const exists = await redis.exists(`chat:${chatId}`);

  if (!exists) payload.createdAt = updatedAt;

  await redis.hset(`chat:${chatId}`, payload);
};
