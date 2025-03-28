import { Redis } from 'https://esm.sh/@upstash/redis@1.25.1';
import RedisMock from './dev-mocks/redis.ts';
import { getEnvironmentVariablesOrFail } from '../utils/env.ts';

export const getRedisInstance = () => {
  if (process.env?.ENV === 'dev') return new RedisMock();

  const { REDIS_URL, REDIS_TOKEN } = getEnvironmentVariablesOrFail(['REDIS_URL', 'REDIS_TOKEN']);

  return new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  });
};
