import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { VestingOptions } from '@openzeppelin/wizard-cairo';
import { vesting } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { vestingSchema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoVesting(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-vesting',
    makeDetailedPrompt(cairoPrompts.Vesting),
    vestingSchema,
    async ({ name, startDate, duration, cliffDuration, schedule, info, macros }) => {
      const opts: VestingOptions = {
        name,
        startDate,
        duration,
        cliffDuration,
        schedule,
        info,
        macros,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintCairoCodeBlock(() => vesting.print(opts)),
          },
        ],
      };
    },
  );
}
