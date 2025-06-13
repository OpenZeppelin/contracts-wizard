import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC20Options } from '@openzeppelin/wizard-stylus';
import { erc20 } from '@openzeppelin/wizard-stylus';
import { safePrint, makeDetailedPrompt } from '../../utils';
import { erc20Schema } from '../schemas';
import { stylusPrompts } from '@openzeppelin/wizard-common';

export function registerStylusERC20(server: McpServer): RegisteredTool {
  return server.tool(
    'stylus-erc20',
    makeDetailedPrompt(stylusPrompts.ERC20),
    erc20Schema,
    async ({
      name,
      burnable,
      permit,
      flashmint,
      info,
    }) => {
      const opts: ERC20Options = {
        name,
        burnable,
        permit,
        flashmint,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => erc20.print(opts)),
          },
        ],
      };
    },
  );
}
