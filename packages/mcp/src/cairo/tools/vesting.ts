import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo-alpha';
import { vesting } from '@openzeppelin/wizard-cairo-alpha';
import { safePrint } from '../../utils.js';
import { vestingSchema } from '../schemas.js';
import { cairoPrompts } from '@ericglau/wizard-common';

export function registerCairoVesting(server: McpServer) {
  server.tool(
    'cairo-vesting',
    cairoPrompts.Vesting,
    vestingSchema,
    async ({
      name,
      startDate,
      duration,
      cliffDuration,
      schedule,
      info,
    }) => {
      const opts: KindedOptions['Vesting'] = {
        kind: 'Vesting',
        name,
        startDate,
        duration,
        cliffDuration,
        schedule,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => vesting.print(opts)),
          },
        ],
      };
    },
  );
}
