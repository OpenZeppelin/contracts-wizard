import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard-stylus';
import { erc721 } from '@openzeppelin/wizard-stylus';
import { safePrint } from '../../utils';
import { erc721Schema } from '../schemas';
import { stylusPrompts } from '@ericglau/wizard-common';

export function registerStylusERC721(server: McpServer): RegisteredTool {
  return server.tool(
    'stylus-erc721',
    stylusPrompts.ERC721,
    erc721Schema,
    async ({
      name,
      burnable,
      enumerable,
      info,
    }) => {
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
            text: safePrint(() => erc721.print(opts)),
          },
        ],
      };
    },
  );
}
