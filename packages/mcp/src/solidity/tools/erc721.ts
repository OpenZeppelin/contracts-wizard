import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard';
import { erc721 } from '@openzeppelin/wizard';
import { safePrint } from '../../utils';
import { erc721Schema } from '../schemas';

export function registerSolidityERC721(server: McpServer): RegisteredTool {
  return server.tool(
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
      const opts: ERC721Options = {
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
