import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AccountOptions } from '@openzeppelin/wizard-stellar';
import { account } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stellarAccountSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';

export function registerStellarAccount(server: McpServer): RegisteredTool {
  return server.tool(
    'stellar-account',
    makeDetailedPrompt(stellarPrompts.Account),
    stellarAccountSchema,
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
      return {
        content: [
          {
            type: 'text',
            text: safePrintRustCodeBlock(() => account.print(opts)),
          },
        ],
      };
    },
  );
}
