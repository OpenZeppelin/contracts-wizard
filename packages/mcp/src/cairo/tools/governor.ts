import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard-cairo';
import { governor } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { cairoGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

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
      try {
        const code = governor.print(opts);
        return wizardAppResult(
          opts,
          safePrintCairoCodeBlock(() => code),
          code,
        );
      } catch {
        return wizardAppResult(
          opts,
          safePrintCairoCodeBlock(() => governor.print(opts)),
          undefined,
          true,
        );
      }
    },
  );
}
