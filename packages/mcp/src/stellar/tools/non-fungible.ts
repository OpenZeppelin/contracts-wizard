import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { NonFungibleOptions } from '@openzeppelin/wizard-stellar';
import { nonFungible } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stellarNonFungibleSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerStellarNonFungible(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stellar-non-fungible',
    {
      description: makeDetailedPrompt(stellarPrompts.NonFungible),
      inputSchema: stellarNonFungibleSchema,
      title: 'Stellar Non-Fungible',
    },
    async ({
      name,
      symbol,
      tokenUri,
      burnable,
      votes,
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
        votes,
        enumerable,
        consecutive,
        pausable,
        mintable,
        sequential,
        upgradeable,
        info,
        explicitImplementations,
      };
      try {
        const code = nonFungible.print(opts);
        return wizardAppResult(
          opts,
          safePrintRustCodeBlock(() => code),
          code,
        );
      } catch {
        return wizardAppResult(
          opts,
          safePrintRustCodeBlock(() => nonFungible.print(opts)),
          undefined,
          true,
        );
      }
    },
  );
}
