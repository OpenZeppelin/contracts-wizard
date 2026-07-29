import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AccountOptions } from '@openzeppelin/wizard-cairo';
import { account } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { cairoAccountSchema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

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
      try {
        const code = account.print(opts);
        return wizardAppResult(
          opts,
          safePrintCairoCodeBlock(() => code),
          code,
        );
      } catch {
        return wizardAppResult(
          opts,
          safePrintCairoCodeBlock(() => account.print(opts)),
          undefined,
          true,
        );
      }
    },
  );
}
