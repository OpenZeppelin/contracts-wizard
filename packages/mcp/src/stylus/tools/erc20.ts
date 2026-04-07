import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC20Options } from '@openzeppelin/wizard-stylus';
import { erc20 } from '@openzeppelin/wizard-stylus';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stylusERC20Schema } from '@openzeppelin/wizard-common/schemas';
import { stylusPrompts } from '@openzeppelin/wizard-common';

export function registerStylusERC20(server: McpServer): RegisteredTool {
  return server.tool(
    'stylus-erc20',
    makeDetailedPrompt(stylusPrompts.ERC20),
    stylusERC20Schema,
    async ({ name, burnable, permit, flashmint, info }) => {
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
            text: safePrintRustCodeBlock(() => erc20.print(opts)),
          },
        ],
      };
    },
  );
}
