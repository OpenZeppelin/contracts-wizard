import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard-stylus';
import { erc1155 } from '@openzeppelin/wizard-stylus';
import { safePrint, makeDetailedPrompt } from '../../utils';
import { erc1155Schema } from '../schemas';
import { stylusPrompts } from '@openzeppelin/wizard-common';

export function registerStylusERC1155(server: McpServer): RegisteredTool {
  return server.tool(
    'stylus-erc1155',
    makeDetailedPrompt(stylusPrompts.ERC1155),
    erc1155Schema,
    async ({
      name,
      burnable,
      supply,
      info,
    }) => {
      const opts: ERC1155Options = {
        name,
        burnable,
        supply,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => erc1155.print(opts)),
          },
        ],
      };
    },
  );
}
