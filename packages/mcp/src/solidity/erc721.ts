import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { erc721 } from '@openzeppelin/wizard';
import { safePrint } from './common/helpers.js';
import { erc721Schema } from './common/schemas.js';

export function registerSolidityERC721(server: McpServer) {
  server.tool(
    'solidity-generate-erc721',
    'Generates an ERC721 smart contract for Solidity, and returns the source code. Does not write to disk.',
    erc721Schema,
    async ({
      name,
      symbol,
      baseUri,
      enumerable,
      uriStorage,
      burnable,
      pausable,
      mintable,
      incremental,
      votes,
      access,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['ERC721'] = {
        kind: 'ERC721',
        name,
        symbol,
        baseUri,
        enumerable,
        uriStorage,
        burnable,
        pausable,
        mintable,
        incremental,
        votes,
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
