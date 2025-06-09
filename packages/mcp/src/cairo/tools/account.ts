import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import { account } from '@openzeppelin/wizard-cairo';
import { safePrint } from '../../utils.js';
import { accountSchema } from '../schemas.js';

export function registerCairoAccount(server: McpServer) {
  server.tool(
    'cairo-generate-account',
    'Generates an Account smart contract for Cairo, and returns the source code. Does not write to disk.',
    accountSchema,
    async ({
      name,
      type,
      declare,
      deploy,
      pubkey,
      outsideExecution,
      upgradeable,
      info,
    }) => {
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
            text: safePrint(() => account.print(opts)),
          },
        ],
      };
    },
  );
}
