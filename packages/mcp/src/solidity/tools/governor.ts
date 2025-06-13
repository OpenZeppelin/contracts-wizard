import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { governor } from '@openzeppelin/wizard';
import { safePrint } from '../../utils';
import { governorSchema } from '../schemas';

export function registerSolidityGovernor(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-generate-governor',
    'Generates a Governor smart contract for Solidity, and returns the source code. Does not write to disk.',
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
      const opts: KindedOptions['Governor'] = {
        kind: 'Governor',
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
            text: safePrint(() => governor.print(opts)),
          },
        ],
      };
    },
  );
}
