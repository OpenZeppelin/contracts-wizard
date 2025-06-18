import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp';
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol';
import type { Implementation, ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types';
import type { ExecutionContext } from 'ava';
import type { z } from 'zod';

export const testMcpInfo: Implementation = {
  name: 'test',
  version: '0.0.0',
};

const testMcpContext: RequestHandlerExtra<ServerRequest, ServerNotification> = {
  signal: { aborted: false } as AbortSignal,
  requestId: 'test-request-id',
  sendNotification: async () => {
    return;
  },
  sendRequest: async () => {
    return {};
  },
};

interface Context {
  tool: RegisteredTool;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodObject<any>;
}

/**
 * Asserts that the MCP tool (`tool` in the AVA test context) returns the same result as the Wizard API.
 * If `expectError` is true, asserts that the MCP tool's returned string contains the error messages from the Wizard API and records a snapshot of the error message.
 * Otherwise, asserts that the MCP tool's returned contract source code is equal to the Wizard API's returned contract source code.
 *
 * @param t The AVA test context.
 * @param params The parameters to pass to the MCP tool.
 * @param wizardApiFunction The Wizard API function to call to print the contract source code.
 * @param expectError Whether to expect an error from the MCP tool.
 */
export async function assertAPIEquivalence<T>(
  t: ExecutionContext<Context>,
  params: T,
  wizardApiFunction: (params: T) => string,
  expectError?: boolean,
) {
  const result = await t.context.tool.callback(
    {
      ...params,
      ...testMcpContext,
    },
    testMcpContext,
  );
  const mcpResult = result?.content[0]?.text as string;

  if (expectError) {
    const apiError = t.throws(() => wizardApiFunction(params));
    t.true(
      mcpResult.includes(apiError.message),
      `Expected MCP error message to include "${apiError.message}", but got "${mcpResult}"`,
    );

    if (typeof apiError === 'object' && apiError !== null && 'messages' in apiError) {
      const apiErrorMessages = apiError.messages as Record<string, string>;
      for (const value of Object.values(apiErrorMessages)) {
        t.true(mcpResult.includes(value), `Expected MCP error message to include "${value}", but got "${mcpResult}"`);
      }
    } else {
      t.fail(`Expected Wizard API options error to have \`messages\` field`);
    }
    t.snapshot(mcpResult);
  } else {
    t.is(mcpResult, wizardApiFunction(params));
  }
}
