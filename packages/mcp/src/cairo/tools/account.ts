import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AccountOptions } from '@openzeppelin/wizard-cairo';
import { account } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { accountSchema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoAccount(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-account',
    makeDetailedPrompt(cairoPrompts.Account),
    accountSchema,
    async ({ name, type, declare, deploy, pubkey, outsideExecution, upgradeable, info }) => {
      const opts: AccountOptions = {
        name,
        type,
        declare,
        deploy,
        pubkey,
        outsideExecution,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintCairoCodeBlock(() => account.print(opts)),
          },
        ],
      };
    },
  );
}
