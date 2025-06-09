import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import { erc1155 } from '@openzeppelin/wizard-cairo';
import { safePrint } from '../utils.js';
import { erc1155Schema } from './common/schemas.js';

export function registerCairoERC1155(server: McpServer) {
  server.tool(
    'cairo-generate-erc1155',
    'Generates an ERC1155 smart contract for Cairo, and returns the source code. Does not write to disk.',
    erc1155Schema,
    async ({
      name,
      baseUri,
      burnable,
      pausable,
      mintable,
      updatableUri,
      royaltyInfo,
      access,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['ERC1155'] = {
        kind: 'ERC1155',
        name,
        baseUri,
        burnable,
        pausable,
        mintable,
        updatableUri,
        royaltyInfo,
        access,
        upgradeable,
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
