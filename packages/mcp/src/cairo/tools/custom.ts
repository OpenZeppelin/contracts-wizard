import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CustomOptions } from '@openzeppelin/wizard-cairo';
import { custom } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { cairoCustomSchema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoCustom(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-custom',
    makeDetailedPrompt(cairoPrompts.Custom),
    cairoCustomSchema,
    async ({ name, pausable, access, upgradeable, info, macros }) => {
      const opts: CustomOptions = {
        name,
        pausable,
        access,
        upgradeable,
        info,
        macros,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintCairoCodeBlock(() => custom.print(opts)),
          },
        ],
      };
    },
  );
}
