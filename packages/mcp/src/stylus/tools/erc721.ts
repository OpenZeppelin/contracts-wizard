import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard-stylus';
import { erc721 } from '@openzeppelin/wizard-stylus';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stylusERC721Schema } from '@openzeppelin/wizard-common/schemas';
import { stylusPrompts } from '@openzeppelin/wizard-common';

export function registerStylusERC721(server: McpServer): RegisteredTool {
  return server.tool(
    'stylus-erc721',
    makeDetailedPrompt(stylusPrompts.ERC721),
    stylusERC721Schema,
    async ({ name, burnable, enumerable, info }) => {
      const opts: ERC721Options = {
        name,
        burnable,
        enumerable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintRustCodeBlock(() => erc721.print(opts)),
          },
        ],
      };
    },
  );
}
