import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { KindedOptions } from '@openzeppelin/wizard';
import { governor } from '@openzeppelin/wizard';
import { safePrint } from './helpers.js';

export function registerSolidityGovernor(server: McpServer) {
  server.tool(
    'solidityGenerateGovernor',
    'Generate a Governor smart contract for Solidity.',
    {
      name: z.string(),
      delay: z.string(),
      period: z.string(),
      votes: z.literal('erc20votes').or(z.literal('erc721votes')).optional(),
      clockMode: z.literal('blocknumber').or(z.literal('timestamp')).optional(),
      timelock: z.literal(false).or(z.literal('openzeppelin')).or(z.literal('compound')).optional(),
      blockTime: z.number().optional(),
      decimals: z.number().optional(),
      proposalThreshold: z.string().optional(),
      quorumMode: z.literal('percent').or(z.literal('absolute')).optional(),
      quorumPercent: z.number().optional(),
      quorumAbsolute: z.string().optional(),
      storage: z.boolean().optional(),
      settings: z.boolean().optional(),
      access: z.literal('ownable').or(z.literal('roles')).or(z.literal('managed')).optional(),
      upgradeable: z.literal('transparent').or(z.literal('uups')).optional(),
      info: z
        .object({
          securityContact: z.string().optional(),
          license: z.string().optional(),
        })
        .optional(),
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
