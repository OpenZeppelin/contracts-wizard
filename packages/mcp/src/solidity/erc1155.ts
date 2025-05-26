import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { erc1155 } from '@openzeppelin/wizard';
import { safePrint } from './common/helpers.js';
import { erc1155Schema } from './common/schemas.js';

export function registerSolidityERC1155(server: McpServer) {
  server.tool(
    'solidity-generate-erc1155',
    'Generates an ERC1155 smart contract for Solidity, and returns the source code. Does not write to disk.',
    erc1155Schema,
    async ({
      name,
      uri,
      burnable,
      pausable,
      mintable,
      supply,
      updatableUri,
      access,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['ERC1155'] = {
        kind: 'ERC1155',
        name,
        uri,
        burnable,
        pausable,
        mintable,
        supply,
        updatableUri,
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
