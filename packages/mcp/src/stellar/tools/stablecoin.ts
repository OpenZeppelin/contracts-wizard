import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard-stellar';
import { stablecoin } from '@openzeppelin/wizard-stellar';
import { makeDetailedPrompt } from '../../utils';
import { stellarStablecoinSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerStellarStablecoin(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stellar-stablecoin',
    {
      description: makeDetailedPrompt(stellarPrompts.Stablecoin),
      inputSchema: stellarStablecoinSchema,
      title: 'Stellar Stablecoin',
    },
    async ({
      name,
      symbol,
      decimals,
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
        decimals,
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
      return wizardAppPrintResult(opts, () => stablecoin.print(opts), 'rust');
    },
  );
}
