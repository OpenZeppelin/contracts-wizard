import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard';
import { erc1155, rewriteForTron } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityERC1155Schema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';

export function registerTronTRC1155(server: McpServer): RegisteredTool {
  return server.tool(
    'tron-trc1155',
    makeDetailedPrompt(tronPrompts.TRC1155),
    solidityERC1155Schema,
    async ({ name, uri, burnable, pausable, mintable, supply, updatableUri, access, upgradeable, info }) => {
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
            text: safePrintSolidityCodeBlock(() => rewriteForTron(erc1155.print(opts))),
          },
        ],
      };
    },
  );
}
