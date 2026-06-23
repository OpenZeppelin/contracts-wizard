import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { VaultOptions } from '@openzeppelin/wizard-stellar';
import { vault } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stellarVaultSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';

export function registerStellarVault(server: McpServer): RegisteredTool {
  return server.tool(
    'stellar-vault',
    makeDetailedPrompt(stellarPrompts.Vault),
    stellarVaultSchema,
    async ({ name, symbol, pausable, upgradeable, access, explicitImplementations, info }) => {
      const opts: VaultOptions = {
        name,
        symbol,
        pausable,
        upgradeable,
        access,
        explicitImplementations,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintRustCodeBlock(() => vault.print(opts)),
          },
        ],
      };
    },
  );
}
