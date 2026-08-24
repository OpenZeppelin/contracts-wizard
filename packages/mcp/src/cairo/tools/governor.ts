import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard-cairo';
import { governor } from '@openzeppelin/wizard-cairo';
import { makeDetailedPrompt } from '../../utils';
import { cairoGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerCairoGovernor(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-governor',
    {
      description: makeDetailedPrompt(cairoPrompts.Governor),
      inputSchema: cairoGovernorSchema,
      title: 'Cairo Governor',
    },
    async ({
      name,
      delay,
      period,
      votes,
      clockMode,
      timelock,
      decimals,
      proposalThreshold,
      quorumMode,
      quorumPercent,
      quorumAbsolute,
      settings,
      upgradeable,
      appName,
      appVersion,
      info,
      macros,
    }) => {
      const opts: GovernorOptions = {
        name,
        delay,
        period,
        votes,
        clockMode,
        timelock,
        decimals,
        proposalThreshold,
        quorumMode,
        quorumPercent,
        quorumAbsolute,
        settings,
        upgradeable,
        appName,
        appVersion,
        info,
        macros,
      };
      return wizardAppPrintResult(opts, () => governor.print(opts), 'cairo');
    },
  );
}
