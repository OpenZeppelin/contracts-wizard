import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard-stellar';
import { stablecoin } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stellarStablecoinSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';

export function registerStellarStablecoin(server: McpServer): RegisteredTool {
  return server.tool(
    'stellar-stablecoin',
    makeDetailedPrompt(stellarPrompts.Stablecoin),
    stellarStablecoinSchema,
    async ({
      name,
      symbol,
      burnable,
      votes,
      pausable,
      premint,
      mintable,
      upgradeable,
      access,
      limitations,
      explicitImplementations,
      info,
    }) => {
      const opts: StablecoinOptions = {
        name,
        symbol,
        burnable,
        votes,
        pausable,
        premint,
        mintable,
        upgradeable,
        access,
        limitations,
        explicitImplementations,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintRustCodeBlock(() => stablecoin.print(opts)),
          },
        ],
      };
    },
  );
}
