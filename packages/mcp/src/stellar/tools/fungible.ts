import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FungibleOptions } from '@openzeppelin/wizard-stellar';
import { fungible } from '@openzeppelin/wizard-stellar';
import { makeDetailedPrompt } from '../../utils';
import { stellarFungibleSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerStellarFungible(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stellar-fungible',
    {
      description: makeDetailedPrompt(stellarPrompts.Fungible),
      inputSchema: stellarFungibleSchema,
      title: 'Stellar Fungible',
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
      info,
      explicitImplementations,
    }) => {
      const opts: FungibleOptions = {
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
        info,
        explicitImplementations,
      };
      return wizardAppPrintResult(opts, () => fungible.print(opts), 'rust');
    },
  );
}
