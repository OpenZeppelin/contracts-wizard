import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo-alpha';
import { erc721 } from '@openzeppelin/wizard-cairo-alpha';
import { safePrint } from '../../utils.js';
import { erc721Schema } from '../schemas.js';

export function registerCairoERC721(server: McpServer) {
  server.tool(
    'cairo-generate-erc721',
    'Generates an ERC721 smart contract for Cairo, and returns the source code. Does not write to disk.',
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