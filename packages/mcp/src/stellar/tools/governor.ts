import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard-stellar';
import { governor } from '@openzeppelin/wizard-stellar';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stellarGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerStellarGovernor(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stellar-governor',
    {
      description: makeDetailedPrompt(stellarPrompts.Governor),
      inputSchema: stellarGovernorSchema,
      languageApp: 'stellar-governor',
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
      try {
        const code = governor.print(opts);
        return wizardAppResult(opts, safePrintRustCodeBlock(() => code), code);
      } catch {
        return wizardAppResult(opts, safePrintRustCodeBlock(() => governor.print(opts)), undefined, true);
      }
    },
  );
}
