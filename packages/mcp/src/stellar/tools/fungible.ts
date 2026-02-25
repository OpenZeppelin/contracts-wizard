import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FungibleOptions } from '@openzeppelin/wizard-stellar';
import { fungible } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { fungibleSchema } from '../schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';

export function registerStellarFungible(server: McpServer): RegisteredTool {
  return server.tool(
    'stellar-fungible',
    makeDetailedPrompt(stellarPrompts.Fungible),
    fungibleSchema,
    async ({
      name,
      symbol,
      burnable,
      pausable,
      premint,
      mintable,
      upgradeable,
      access,
      info,
      explicitImplementations,
    }) => {
      const opts: FungibleOptions = {
        name,
        symbol,
        burnable,
        pausable,
        premint,
        mintable,
        upgradeable,
        access,
        info,
        explicitImplementations,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintRustCodeBlock(() => fungible.print(opts)),
          },
        ],
      };
    },
  );
}
