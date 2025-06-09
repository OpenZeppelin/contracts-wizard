import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import { governor } from '@openzeppelin/wizard-cairo';
import { safePrint } from '../../utils.js';
import { governorSchema } from '../schemas.js';

export function registerCairoGovernor(server: McpServer) {
  server.tool(
    'cairo-generate-governor',
    'Generates a Governor smart contract for Cairo, and returns the source code. Does not write to disk.',
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
