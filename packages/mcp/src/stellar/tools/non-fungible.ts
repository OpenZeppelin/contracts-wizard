import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { NonFungibleOptions } from '@openzeppelin/wizard-stellar';
import { nonFungible } from '@openzeppelin/wizard-stellar';
import { safePrint } from '../../utils';
import { nonFungibleSchema } from '../schemas';

export function registerStellarNonFungible(server: McpServer): RegisteredTool {
  return server.tool(
    'stellar-generate-non-fungible',
    'Generates a non-fungible token smart contract for Stellar, based on the Non-Fungible Token Standard, compatible with SEP-50, similar to ERC-721. Returns the source code. Does not write to disk.',
    nonFungibleSchema,
    async ({
      name,
      symbol,
      burnable,
      enumerable,
      consecutive,
      pausable,
      mintable,
      sequential,
      upgradeable,
      info,
    }) => {
      const opts: NonFungibleOptions = {
        name,
        symbol,
        burnable,
        enumerable,
        consecutive,
        pausable,
        mintable,
        sequential,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => nonFungible.print(opts)),
          },
        ],
      };
    },
  );
}