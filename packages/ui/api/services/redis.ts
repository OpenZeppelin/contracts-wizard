import { Redis } from '@upstash/redis';
import RedisMock from './dev-mocks/redis.ts';
import { getEnvironmentVariableOr, getEnvironmentVariablesOrFail } from '../utils/env.ts';

type RedisChat = {
  id: string;
  messages: unknown[];
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

export const saveChatInRedisIfDoesNotExist =
  (chatId: string, ChatMessagess: unknown[]) => async (completion: string) => {
    const redis = getRedisInstance();

    const updatedAt = Date.now();
    const payload: RedisChat = {
      id: chatId,
      updatedAt,
      messages: [
        ...ChatMessagess,
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
