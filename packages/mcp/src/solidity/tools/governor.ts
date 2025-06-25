import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard';
import { governor } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { governorSchema } from '../schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';

export function registerSolidityGovernor(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-governor',
    makeDetailedPrompt(solidityPrompts.Governor),
    governorSchema,
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
      return {
        content: [
          {
            type: 'text',
            text: safePrintSolidityCodeBlock(() => governor.print(opts)),
          },
        ],
      };
    },
  );
}
