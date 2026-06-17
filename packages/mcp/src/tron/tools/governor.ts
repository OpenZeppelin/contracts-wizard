import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GovernorOptions } from '@openzeppelin/wizard';
import { governor, rewriteForTron, TRON_DEFAULT_BLOCK_TIME } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { tronGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';

export function registerTronGovernor(server: McpServer): RegisteredTool {
  return server.tool(
    'tron-governor',
    makeDetailedPrompt(tronPrompts.Governor),
    tronGovernorSchema,
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
        // TRON produces blocks every ~3s (vs ~12s on Ethereum); apply that
        // default when the caller hasn't supplied one so the generated
        // voting delay/period in blocks matches TRON's chain.
        blockTime: blockTime ?? TRON_DEFAULT_BLOCK_TIME,
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
            text: safePrintSolidityCodeBlock(() => rewriteForTron(governor.print(opts))),
          },
        ],
      };
    },
  );
}
