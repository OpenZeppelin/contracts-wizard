import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { NonFungibleOptions } from '@openzeppelin/wizard-stellar';
import { nonFungible } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { nonFungibleSchema } from '../schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';

export function registerStellarNonFungible(server: McpServer): RegisteredTool {
  return server.tool(
    'stellar-non-fungible',
    makeDetailedPrompt(stellarPrompts.NonFungible),
    nonFungibleSchema,
    async ({
      name,
      symbol,
      tokenUri,
      burnable,
      enumerable,
      consecutive,
      pausable,
      mintable,
      sequential,
      upgradeable,
      info,
      explicitImplementations,
    }) => {
      const opts: NonFungibleOptions = {
        name,
        symbol,
        tokenUri,
        burnable,
        enumerable,
        consecutive,
        pausable,
        mintable,
        sequential,
        upgradeable,
        info,
        explicitImplementations,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintRustCodeBlock(() => nonFungible.print(opts)),
          },
        ],
      };
    },
  );
}
