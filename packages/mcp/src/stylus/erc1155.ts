import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-stylus';
import { erc1155 } from '@openzeppelin/wizard-stylus';
import { safePrint } from '../utils.js';
import { erc1155Schema } from './common/schemas.js';

export function registerStylusERC1155(server: McpServer) {
  server.tool(
    'stylus-generate-erc1155',
    'Generates an ERC1155 smart contract for Stylus, and returns the source code. Does not write to disk.',
    erc1155Schema,
    async ({
      name,
      burnable,
      supply,
      info,
    }) => {
      const opts: KindedOptions['ERC1155'] = {
        kind: 'ERC1155',
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
