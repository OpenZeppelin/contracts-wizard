import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import { account } from '@openzeppelin/wizard-cairo';
import { safePrintCodeBlock, makeDetailedPrompt } from '../../utils';
import { accountSchema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoAccount(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-account',
    makeDetailedPrompt(cairoPrompts.Account),
    accountSchema,
    async ({ name, type, declare, deploy, pubkey, outsideExecution, upgradeable, info }) => {
      const opts: KindedOptions['Account'] = {
        kind: 'Account',
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
            text: safePrintCodeBlock(() => account.print(opts)),
          },
        ],
      };
    },
  );
}
