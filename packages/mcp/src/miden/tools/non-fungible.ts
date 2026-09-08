import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { NonFungibleOptions } from '@openzeppelin/wizard-miden';
import { nonFungible } from '@openzeppelin/wizard-miden';
import { makeDetailedPrompt } from '../../utils';
import { midenNonFungibleSchema } from '@openzeppelin/wizard-common/schemas';
import { midenPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerMidenNonFungible(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'miden-non-fungible',
    {
      description: makeDetailedPrompt(midenPrompts.NonFungible),
      inputSchema: midenNonFungibleSchema,
      title: 'Miden Non-Fungible',
    },
    async ({
      name,
      symbol,
      description,
      logoUri,
      contractUri,
      updatableMetadata,
      burnable,
      pausable,
      restrictions,
      switchablePolicies,
      access,
      info,
    }) => {
      const opts: NonFungibleOptions = {
        name,
        symbol,
        description,
        logoUri,
        contractUri,
        updatableMetadata,
        burnable,
        pausable,
        restrictions,
        switchablePolicies,
        access,
        info,
      };
      return wizardAppPrintResult(opts, () => nonFungible.print(opts), 'rust');
    },
  );
}
