import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard-stellar';
import { governor } from '@openzeppelin/wizard-stellar';
import { makeDetailedPrompt } from '../../utils';
import { stellarGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerStellarGovernor(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stellar-governor',
    {
      description: makeDetailedPrompt(stellarPrompts.Governor),
      inputSchema: stellarGovernorSchema,
      title: 'Stellar Governor',
    },
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
      return wizardAppPrintResult(opts, () => governor.print(opts), 'rust');
    },
  );
}
