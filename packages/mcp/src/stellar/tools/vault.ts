import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { VaultOptions } from '@openzeppelin/wizard-stellar';
import { vault } from '@openzeppelin/wizard-stellar';
import { makeDetailedPrompt } from '../../utils';
import { stellarVaultSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerStellarVault(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stellar-vault',
    {
      description: makeDetailedPrompt(stellarPrompts.Vault),
      inputSchema: stellarVaultSchema,
      title: 'Stellar Vault',
    },
    async ({ name, symbol, decimalsOffset, pausable, upgradeable, access, explicitImplementations, info }) => {
      const opts: VaultOptions = {
        name,
        symbol,
        decimalsOffset,
        pausable,
        upgradeable,
        access,
        explicitImplementations,
        info,
      };
      return wizardAppPrintResult(opts, () => vault.print(opts), 'rust');
    },
  );
}
