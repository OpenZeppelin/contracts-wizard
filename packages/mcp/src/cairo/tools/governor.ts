import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo-alpha';
import { governor } from '@openzeppelin/wizard-cairo-alpha';
import { safePrint, makeDetailedPrompt } from '../../utils';
import { governorSchema } from '../schemas';
import { cairoPrompts } from '@ericglau/wizard-common';

export function registerCairoGovernor(server: McpServer) {
  server.tool(
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
    }) => {
      const opts: KindedOptions['Governor'] = {
        kind: 'Governor',
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
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => governor.print(opts)),
          },
        ],
      };
    },
  );
}
