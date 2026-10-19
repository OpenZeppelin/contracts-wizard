import * as solidityFunctions from './ai-assistant/function-definitions/solidity.ts';
import * as polkadotFunctions from './ai-assistant/function-definitions/polkadot.ts';
import * as cairoFunctions from './ai-assistant/function-definitions/cairo.ts';
import * as cairoAlphaFunctions from './ai-assistant/function-definitions/cairo-alpha.ts';
import * as stellarFunctions from './ai-assistant/function-definitions/stellar.ts';
import * as stylusFunctions from './ai-assistant/function-definitions/stylus.ts';
import * as tronFunctions from './ai-assistant/function-definitions/tron.ts';
import * as confidentialFunctions from './ai-assistant/function-definitions/confidential.ts';
import * as uniswapHooksFunctions from './ai-assistant/function-definitions/uniswap-hooks.ts';
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
    polkadot: polkadotFunctions,
    stellar: stellarFunctions,
    stylus: stylusFunctions,
    tron: tronFunctions,
    confidential: confidentialFunctions,
    uniswapHooks: uniswapHooksFunctions,
  };

  return (Object.values(functionPerLanguages[language] ?? {}) as SimpleAiFunctionDefinition[]).map(
    functionDefinition => ({
      type: 'function',
      function: functionDefinition,
    }),
  );
};

const buildAiChatMessages = (request: AiChatBodyRequest): ChatMessages => {
  const validatedMessages = request.messages.filter((message: { role: string; content: string }) => {
    return message.content.length < 500;
  });

  const currentKind = request.currentOpts && 'kind' in request.currentOpts ? request.currentOpts.kind : undefined;
  const currentDefinition = getFunctionsContext(request.language).find(tool => tool.function.name === currentKind)
    ?.function.description;

  return [
    {
      role: 'system',
      content: `
      You are a smart contract assistant built by OpenZeppelin to help users using OpenZeppelin Contracts Wizard.
      The current options are ${JSON.stringify(request.currentOpts)}.
      The current contract code is ${request.currentCode}, written for the ${request.language} ecosystem.
      Treat these current options and code as the actual state, even if earlier messages claimed an edit succeeded.
      Follow the latest requested edits and preserve other options. Use the tool definitions as the source of supported features.
      Do not transfer restrictions from one contract type to another. Explain unsupported combinations and ask which feature to keep instead of silently changing the request.
      Call a tool only when changing settings; if the requested state already matches, say that no change is needed.
      For a rename, put the newly requested name and symbol in the tool arguments, not the previous values.
      Never invent deployment addresses. Generated code does not deploy or configure pools, policy engines or identities.
      Please be kind and concise. Keep responses to <100 words.
    `.trim(),
    },
    ...validatedMessages,
    {
      role: 'system',
      content: `Current settings (authoritative, after the conversation above): ${JSON.stringify(request.currentOpts)}.
      Current contract type capabilities: ${currentDefinition ?? 'Consult the selected tool definition.'}
      For a requested contract type change, consult that type's tool definition instead.
      Apply the latest user request to this actual state; earlier claims of success are not proof an edit happened.`,
    },
  ];
};

export default async (req: Request): Promise<Response> => {
  try {
    const aiChatBodyRequest: AiChatBodyRequest = await req.json();

    const chatMessages = buildAiChatMessages(aiChatBodyRequest);

    const openAiStream = createOpenAiCompletionStream({
      streamParams: {
        messages: chatMessages,
        tools: getFunctionsContext(aiChatBodyRequest.language),
      },
      chatId: aiChatBodyRequest.chatId,
      onAiStreamCompletion: async ({ chatId, chatMessages }, finalStreamResult) =>
        finalStreamResult && (await saveChatInRedisIfDoesNotExist(chatId, chatMessages)(finalStreamResult)),
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
