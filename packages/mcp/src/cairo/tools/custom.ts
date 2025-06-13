import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo-alpha';
import { custom } from '@openzeppelin/wizard-cairo-alpha';
import { safePrint } from '../../utils.js';
import { customSchema } from '../schemas.js';

export function registerCairoCustom(server: McpServer) {
  server.tool(
    'cairo-generate-custom',
    'Generates a custom smart contract for Cairo, and returns the source code. Does not write to disk.',
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
