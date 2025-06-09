import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import { vesting } from '@openzeppelin/wizard-cairo';
import { safePrint } from '../utils.js';
import { vestingSchema } from './common/schemas.js';

export function registerCairoVesting(server: McpServer) {
  server.tool(
    'cairo-generate-vesting',
    'Generates a Vesting smart contract for Cairo, and returns the source code. Does not write to disk.',
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
