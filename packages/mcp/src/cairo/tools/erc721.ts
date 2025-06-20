import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard-cairo';
import { erc721 } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { erc721Schema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoERC721(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-erc721',
    makeDetailedPrompt(cairoPrompts.ERC721),
    erc721Schema,
    async ({
      name,
      symbol,
      baseUri,
      burnable,
      pausable,
      mintable,
      enumerable,
      votes,
      royaltyInfo,
      appName,
      appVersion,
      access,
      upgradeable,
      info,
    }) => {
      const opts: ERC721Options = {
        name,
        symbol,
        baseUri,
        burnable,
        pausable,
        mintable,
        enumerable,
        votes,
        royaltyInfo,
        appName,
        appVersion,
        access,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintCairoCodeBlock(() => erc721.print(opts)),
          },
        ],
      };
    },
  );
}
