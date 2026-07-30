import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AccountOptions } from '@openzeppelin/wizard-cairo';
import { account } from '@openzeppelin/wizard-cairo';
import { makeDetailedPrompt } from '../../utils';
import { cairoAccountSchema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerCairoAccount(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-account',
    {
      description: makeDetailedPrompt(cairoPrompts.Account),
      inputSchema: cairoAccountSchema,
      title: 'Cairo Account',
    },
    async ({ name, type, declare, deploy, pubkey, outsideExecution, upgradeable, info, macros }) => {
      const opts: AccountOptions = {
        name,
        type,
        declare,
        deploy,
        pubkey,
        outsideExecution,
        upgradeable,
        info,
        macros,
      };
      return wizardAppPrintResult(opts, () => account.print(opts), 'cairo');
    },
  );
}
