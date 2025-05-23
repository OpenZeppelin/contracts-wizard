import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { KindedOptions } from '@openzeppelin/wizard';
import { stablecoin } from '@openzeppelin/wizard';
import { safePrint } from './helpers.js';

export function registerSolidityStablecoin(server: McpServer) {
  server.tool(
    'solidityGenerateStablecoin',
    'Generate a Stablecoin smart contract for Solidity',
    {
      name: z.string(),
      symbol: z.string(),
      burnable: z.boolean().optional(),
      pausable: z.boolean().optional(),
      premint: z.string().optional(),
      premintChainId: z.string().optional(),
      mintable: z.boolean().optional(),
      callback: z.boolean().optional(),
      permit: z.boolean().optional(),
      votes: z.literal('blocknumber').or(z.literal('timestamp')).optional(),
      flashmint: z.boolean().optional(),
      crossChainBridging: z.literal('custom').or(z.literal('superchain')).optional(),
      access: z.literal('ownable').or(z.literal('roles')).or(z.literal('managed')).optional(),
      upgradeable: z.literal('transparent').or(z.literal('uups')).optional(),
      info: z
        .object({
          securityContact: z.string().optional(),
          license: z.string().optional(),
        })
        .optional(),
      limitations: z.literal(false).or(z.literal('allowlist')).or(z.literal('blocklist')).optional(),
      custodian: z.boolean().optional(),
    },
    async ({
      name,
      symbol,
      burnable,
      pausable,
      premint,
      premintChainId,
      mintable,
      callback,
      permit,
      votes,
      flashmint,
      crossChainBridging,
      access,
      upgradeable,
      info,
      limitations,
      custodian,
    }) => {
      const opts: KindedOptions['Stablecoin'] = {
        kind: 'Stablecoin',
        name,
        symbol,
        burnable,
        pausable,
        premint,
        premintChainId,
        mintable,
        callback,
        permit,
        votes,
        flashmint,
        crossChainBridging,
        access,
        upgradeable,
        info,
        limitations,
        custodian,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => stablecoin.print(opts)),
          },
        ],
      };
    },
  );
}
