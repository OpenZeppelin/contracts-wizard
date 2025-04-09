import OpenAI from 'openai';
import { getEnvironmentVariablesOrFail } from '../utils/env.ts';

export const getOpenAiInstance = () => {
  const { OPENAI_API_KEY } = getEnvironmentVariablesOrFail('OPENAI_API_KEY');

  return new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
};
