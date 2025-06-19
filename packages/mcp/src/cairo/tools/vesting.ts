import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import { vesting } from '@openzeppelin/wizard-cairo';
import { safePrintCodeBlock, makeDetailedPrompt } from '../../utils';
import { vestingSchema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoVesting(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-vesting',
    makeDetailedPrompt(cairoPrompts.Vesting),
    vestingSchema,
    async ({ name, startDate, duration, cliffDuration, schedule, info }) => {
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
            text: safePrintCodeBlock(() => vesting.print(opts)),
          },
        ],
      };
    },
  );
}
