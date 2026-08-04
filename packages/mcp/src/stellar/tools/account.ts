import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AccountOptions } from '@openzeppelin/wizard-stellar';
import { account } from '@openzeppelin/wizard-stellar';
import { makeDetailedPrompt } from '../../utils';
import { stellarAccountSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerStellarAccount(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stellar-account',
    {
      description: makeDetailedPrompt(stellarPrompts.Account),
      inputSchema: stellarAccountSchema,
      title: 'Stellar Account',
    },
    async ({
      name,
      delegatedSigners,
      ed25519Signers,
      webauthnSigners,
      policy,
      executionEntryPoint,
      upgradeable,
      info,
    }) => {
      const opts: AccountOptions = {
        name,
        delegatedSigners,
        ed25519Signers,
        webauthnSigners,
        policy,
        executionEntryPoint,
        upgradeable,
        info,
      };
      return wizardAppPrintResult(opts, () => account.print(opts), 'rust');
    },
  );
}
