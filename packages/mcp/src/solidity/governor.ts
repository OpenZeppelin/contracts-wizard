import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { governor } from '@openzeppelin/wizard';
import { safePrint } from './common/helpers.js';
import { governorSchema } from './common/schemas.js';

export function registerSolidityGovernor(server: McpServer) {
  server.tool(
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
      access,
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
        access,
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
