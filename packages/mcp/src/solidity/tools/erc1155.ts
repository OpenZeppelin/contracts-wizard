import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options, KindedOptions } from '@openzeppelin/wizard';
import { erc1155 } from '@openzeppelin/wizard';
import { safePrint } from '../../utils';
import { erc1155Schema } from '../schemas';

export function registerSolidityERC1155(server: McpServer): RegisteredTool {
  return server.tool(
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
      const opts: ERC1155Options = {
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
