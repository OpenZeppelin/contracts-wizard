import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard';
import { erc1155 } from '@openzeppelin/wizard';
import { safePrint, makeDetailedPrompt } from '../../utils';
import { erc1155Schema } from '../schemas';
import { solidityPrompts } from '@ericglau/wizard-common';

export function registerSolidityERC1155(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-erc1155',
    makeDetailedPrompt(solidityPrompts.ERC1155),
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
