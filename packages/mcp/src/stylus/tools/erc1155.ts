import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard-stylus';
import { erc1155 } from '@openzeppelin/wizard-stylus';
import { safePrint } from '../../utils';
import { erc1155Schema } from '../schemas';

export function registerStylusERC1155(server: McpServer): RegisteredTool {
  return server.tool(
    'stylus-generate-erc1155',
    'Generates an ERC1155 smart contract for Stylus, and returns the source code. Does not write to disk.',
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
