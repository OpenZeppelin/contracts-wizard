import OpenAI from 'https://esm.sh/openai@4.11.0';
import { getEnvironmentVariablesOrFail } from '../utils/env.ts';

export const getOpenAiInstance = () => {
  const { OPENAI_API_KEY } = getEnvironmentVariablesOrFail('OPENAI_API_KEY');

  return new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
};
