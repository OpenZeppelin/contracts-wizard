import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { KindedOptions } from '@openzeppelin/wizard';
import { stablecoin } from '@openzeppelin/wizard';
import { safePrint } from './helpers.js';
import { erc20Schema } from './erc20.js';

export const stablecoinSchema = {
  ...erc20Schema,
  limitations: z.literal(false).or(z.literal('allowlist')).or(z.literal('blocklist')).optional(),
  custodian: z.boolean().optional(),
}

export function registerSolidityStablecoin(server: McpServer) {
  server.tool(
    'solidityGenerateStablecoin',
    'Generate a Stablecoin smart contract for Solidity (Experimental: Some features are not audited and are subject to change)',
    stablecoinSchema,
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
