import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo-alpha';
import { custom } from '@openzeppelin/wizard-cairo-alpha';
import { safePrint, makeDetailedPrompt } from '../../utils';
import { customSchema } from '../schemas';
import { cairoPrompts } from '@ericglau/wizard-common';

export function registerCairoCustom(server: McpServer) {
  server.tool(
    'cairo-custom',
    makeDetailedPrompt(cairoPrompts.Custom),
    customSchema,
    async ({
      name,
      pausable,
      access,
      upgradeable,
      info,
    }) => {
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
            text: safePrint(() => custom.print(opts)),
          },
        ],
      };
    },
  );
}
