import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import { custom } from '@openzeppelin/wizard-cairo';
import { safePrintCodeBlock, makeDetailedPrompt } from '../../utils';
import { customSchema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoCustom(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-custom',
    makeDetailedPrompt(cairoPrompts.Custom),
    customSchema,
    async ({ name, pausable, access, upgradeable, info }) => {
      const opts: KindedOptions['Custom'] = {
        kind: 'Custom',
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
