import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard-cairo';
import { erc1155 } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { erc1155Schema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoERC1155(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-erc1155',
    makeDetailedPrompt(cairoPrompts.ERC1155),
    erc1155Schema,
    async ({ name, baseUri, burnable, pausable, mintable, updatableUri, royaltyInfo, access, upgradeable, info, macros }) => {
      const opts: ERC1155Options = {
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
        macros,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintCairoCodeBlock(() => erc1155.print(opts)),
          },
        ],
      };
    },
  );
}
