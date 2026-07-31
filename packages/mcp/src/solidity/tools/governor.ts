import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard';
import { governor } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

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
      crossChainExecution,
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
        crossChainExecution,
        upgradeable,
        info,
      };
      return wizardAppPrintResult(opts, () => governor.print(opts), 'solidity');
    },
  );
}
