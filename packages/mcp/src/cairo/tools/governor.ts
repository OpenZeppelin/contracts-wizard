import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard-cairo';
import { governor } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { governorSchema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoGovernor(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-governor',
    makeDetailedPrompt(cairoPrompts.Governor),
    governorSchema,
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
      return {
        content: [
          {
            type: 'text',
            text: safePrintCairoCodeBlock(() => governor.print(opts)),
          },
        ],
      };
    },
  );
}
