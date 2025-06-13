import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo-alpha';
import { erc1155 } from '@openzeppelin/wizard-cairo-alpha';
import { safePrint, makeDetailedPrompt } from '../../utils';
import { erc1155Schema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoERC1155(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-erc1155',
    makeDetailedPrompt(cairoPrompts.ERC1155),
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
