import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FungibleOptions } from '@openzeppelin/wizard-stellar';
import { fungible } from '@openzeppelin/wizard-stellar';
import { safePrint } from '../../utils';
import { fungibleSchema } from '../schemas';
import { stellarPrompts } from '@ericglau/wizard-common';

export function registerStellarFungible(server: McpServer): RegisteredTool {
  return server.tool(
    'stellar-fungible',
    stellarPrompts.Fungible,
    fungibleSchema,
    async ({
      name,
      symbol,
      burnable,
      pausable,
      premint,
      mintable,
      upgradeable,
      info,
    }) => {
      const opts: FungibleOptions = {
        name,
        symbol,
        burnable,
        pausable,
        premint,
        mintable,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => fungible.print(opts)),
          },
        ],
      };
    },
  );
}
