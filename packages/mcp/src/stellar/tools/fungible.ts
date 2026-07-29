import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FungibleOptions } from '@openzeppelin/wizard-stellar';
import { fungible } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stellarFungibleSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

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
      try {
        const code = fungible.print(opts);
        return wizardAppResult(
          opts,
          safePrintRustCodeBlock(() => code),
          code,
        );
      } catch {
        return wizardAppResult(
          opts,
          safePrintRustCodeBlock(() => fungible.print(opts)),
          undefined,
          true,
        );
      }
    },
  );
}
