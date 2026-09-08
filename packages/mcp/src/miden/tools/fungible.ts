import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FungibleOptions } from '@openzeppelin/wizard-miden';
import { fungible } from '@openzeppelin/wizard-miden';
import { makeDetailedPrompt } from '../../utils';
import { midenFungibleSchema } from '@openzeppelin/wizard-common/schemas';
import { midenPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerMidenFungible(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'miden-fungible',
    {
      description: makeDetailedPrompt(midenPrompts.Fungible),
      inputSchema: midenFungibleSchema,
      title: 'Miden Fungible',
    },
    async ({
      name,
      symbol,
      decimals,
      maxSupply,
      description,
      logoUri,
      externalLink,
      updatableMetadata,
      updatableMaxSupply,
      burnable,
      minBurnAmount,
      pausable,
      restrictions,
      switchablePolicies,
      access,
      info,
    }) => {
      const opts: FungibleOptions = {
        name,
        symbol,
        decimals,
        maxSupply,
        description,
        logoUri,
        externalLink,
        updatableMetadata,
        updatableMaxSupply,
        burnable,
        minBurnAmount,
        pausable,
        restrictions,
        switchablePolicies,
        access,
        info,
      };
      return wizardAppPrintResult(opts, () => fungible.print(opts), 'rust');
    },
  );
}
