import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import { erc721 } from '@openzeppelin/wizard-cairo';
import { safePrint, makeDetailedPrompt } from '../../utils';
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
      const opts: KindedOptions['ERC721'] = {
        kind: 'ERC721',
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
            text: safePrint(() => erc721.print(opts)),
          },
        ],
      };
    },
  );
}