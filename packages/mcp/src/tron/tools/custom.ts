import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CustomOptions } from '@openzeppelin/wizard';
import { custom, rewriteForTron } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityCustomSchema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';

export function registerTronCustom(server: McpServer): RegisteredTool {
  return server.tool(
    'tron-custom',
    makeDetailedPrompt(tronPrompts.Custom),
    solidityCustomSchema,
    async ({ name, pausable, access, upgradeable, info }) => {
      const opts: CustomOptions = {
        name,
        pausable,
        access,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintSolidityCodeBlock(() => rewriteForTron(custom.print(opts))),
          },
        ],
      };
    },
  );
}
