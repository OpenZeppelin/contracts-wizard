import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { hooks, type HooksOptions } from '@openzeppelin/wizard-uniswap-hooks';
import { hooksSchema } from '../schemas';
import { makeDetailedPrompt, safePrintSolidityCodeBlock } from '../../utils';
import { uniswapHooksPrompts } from '@openzeppelin/wizard-common';

export function registerUniswapHooks(server: McpServer): RegisteredTool {
  return server.tool(
    'uniswap-hooks',
    makeDetailedPrompt(uniswapHooksPrompts.Hooks),
    hooksSchema,
    async ({
      hook,
      name,
      pausable,
      currencySettler,
      safeCast,
      transientStorage,
      shares,
      permissions,
      inputs,
      access,
      info,
    }) => {
      const opts: HooksOptions = {
        hook,
        name,
        pausable,
        currencySettler,
        safeCast,
        transientStorage,
        shares,
        permissions,
        inputs,
        access,
        info,
      };

      return {
        content: [
          {
            type: 'text',
            text: safePrintSolidityCodeBlock(() => hooks.print(opts)),
          },
        ],
      };
    },
  );
}
