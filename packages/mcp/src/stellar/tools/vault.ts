import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { VaultOptions } from '@openzeppelin/wizard-stellar';
import { vault } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stellarVaultSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerStellarVault(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stellar-vault',
    {
      description: makeDetailedPrompt(stellarPrompts.Vault),
      inputSchema: stellarVaultSchema,
      languageApp: 'stellar-vault',
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
      try {
        const code = vault.print(opts);
        return wizardAppResult(opts, safePrintRustCodeBlock(() => code), code);
      } catch {
        return wizardAppResult(opts, safePrintRustCodeBlock(() => vault.print(opts)), undefined, true);
      }
    },
  );
}
