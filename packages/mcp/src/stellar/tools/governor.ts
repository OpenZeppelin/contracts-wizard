import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard-stellar';
import { governor } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stellarGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';

export function registerStellarGovernor(server: McpServer): RegisteredTool {
  return server.tool(
    'stellar-governor',
    makeDetailedPrompt(stellarPrompts.Governor),
    stellarGovernorSchema,
    async ({
      name,
      version,
      votingDelay,
      votingPeriod,
      proposalThreshold,
      quorum,
      timelock,
      upgradeable,
      access,
      explicitImplementations,
      info,
    }) => {
      const opts: GovernorOptions = {
        name,
        version,
        votingDelay,
        votingPeriod,
        proposalThreshold,
        quorum,
        timelock,
        upgradeable,
        access,
        explicitImplementations,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintRustCodeBlock(() => governor.print(opts)),
          },
        ],
      };
    },
  );
}
