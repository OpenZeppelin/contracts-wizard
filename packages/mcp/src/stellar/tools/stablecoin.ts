import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard-stellar';
import { stablecoin } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stablecoinSchema } from '../schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';

export function registerStellarStablecoin(server: McpServer): RegisteredTool {
  return server.tool(
    'stellar-stablecoin',
    makeDetailedPrompt(stellarPrompts.Stablecoin),
    stablecoinSchema,
    async ({ name, symbol, burnable, pausable, premint, mintable, upgradeable, access, limitations, info }) => {
      const opts: StablecoinOptions = {
        name,
        symbol,
        burnable,
        pausable,
        premint,
        mintable,
        upgradeable,
        access,
        limitations,
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
