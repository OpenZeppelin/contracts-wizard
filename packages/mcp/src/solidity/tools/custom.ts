import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CustomOptions } from '@openzeppelin/wizard';
import { custom } from '@openzeppelin/wizard';
import { safePrintCodeBlock, makeDetailedPrompt } from '../../utils';
import { customSchema } from '../schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';

export function registerSolidityCustom(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-custom',
    makeDetailedPrompt(solidityPrompts.Custom),
    customSchema,
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
            text: safePrintCodeBlock(() => custom.print(opts)),
          },
        ],
      };
    },
  );
}
