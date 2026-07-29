import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard';
import { governor } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerSolidityGovernor(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'solidity-governor',
    {
      description: makeDetailedPrompt(solidityPrompts.Governor),
      inputSchema: solidityGovernorSchema,
      title: 'Solidity Governor',
    },
    async ({
      name,
      delay,
      period,
      votes,
      clockMode,
      timelock,
      blockTime,
      decimals,
      proposalThreshold,
      quorumMode,
      quorumPercent,
      quorumAbsolute,
      storage,
      settings,
      upgradeable,
      info,
    }) => {
      const opts: GovernorOptions = {
        name,
        delay,
        period,
        votes,
        clockMode,
        timelock,
        blockTime,
        decimals,
        proposalThreshold,
        quorumMode,
        quorumPercent,
        quorumAbsolute,
        storage,
        settings,
        upgradeable,
        info,
      };
      try {
        const code = governor.print(opts);
        return wizardAppResult(opts, safePrintSolidityCodeBlock(() => code), code);
      } catch {
        return wizardAppResult(opts, safePrintSolidityCodeBlock(() => governor.print(opts)), undefined, true);
      }
    },
  );
}
