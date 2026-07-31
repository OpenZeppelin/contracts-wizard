import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { VestingOptions } from '@openzeppelin/wizard-cairo';
import { vesting } from '@openzeppelin/wizard-cairo';
import { makeDetailedPrompt } from '../../utils';
import { cairoVestingSchema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerCairoVesting(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-vesting',
    {
      description: makeDetailedPrompt(cairoPrompts.Vesting),
      inputSchema: cairoVestingSchema,
      title: 'Cairo Vesting',
    },
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
      return wizardAppPrintResult(opts, () => vesting.print(opts), 'cairo');
    },
  );
}
