import OpenAI from 'openai';
import { getEnvironmentVariableOr, getEnvironmentVariablesOrFail } from '../utils/env.ts';

export const getOpenAiInstance = () => {
  const { OPENAI_API_KEY } = getEnvironmentVariablesOrFail('OPENAI_API_KEY');

  return new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
};

export type ChatMessage = OpenAI.Chat.ChatCompletionCreateParams['messages'];

type ProcessOpenAiStreamParams = {
  openAiStream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk> & { controller?: AbortController };
  chatMessages: ChatMessage;
  chatId: string;
};
type OnAiStreamCompletion = (
  processOpenAiStreamParams: ProcessOpenAiStreamParams,
  processOpenAiStreamResults: string,
) => Promise<unknown>;

const processOpenAIStream = (
  { openAiStream, chatMessages, chatId }: ProcessOpenAiStreamParams,
  onAiStreamCompletion?: OnAiStreamCompletion,
) =>
  new ReadableStream({
    async pull(controller: ReadableStreamDefaultController<Uint8Array>) {
      const textEncoder = new TextEncoder();
      let finalResponse = '';
      const finalToolCall = {
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
        if (onAiStreamCompletion)
          await onAiStreamCompletion(
            { openAiStream, chatId, chatMessages },
            finalResponse || JSON.stringify(finalToolCall),
          );
      }
    },
    cancel() {
      openAiStream.controller?.abort?.();
    },
  });

export const createOpenAiCompletionStream = ({
  streamParams,
  chatId,
  onAiStreamCompletion,
}: {
  streamParams: Omit<OpenAI.Chat.ChatCompletionCreateParams, 'model' | 'stream'>;
  chatId: string;
  onAiStreamCompletion?: OnAiStreamCompletion;
}) => {
  const openai = getOpenAiInstance();

  const openAiStream = openai.chat.completions.stream({
    model: getEnvironmentVariableOr('OPENAI_MODEL', 'gpt-4o-mini'),
    temperature: 0.7,
    stream: true,
    ...streamParams,
  });

  return processOpenAIStream(
    { openAiStream, chatMessages: streamParams.messages, chatId: chatId },
    onAiStreamCompletion,
  );
};
