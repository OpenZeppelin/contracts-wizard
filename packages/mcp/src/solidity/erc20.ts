import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { KindedOptions } from '@openzeppelin/wizard';
import { erc20 } from '@openzeppelin/wizard';
import { safePrint } from './helpers.js';

export const erc20Schema = {
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
};

export function registerSolidityERC20(server: McpServer) {
  server.tool(
    'solidityGenerateERC20',
    'Generate an ERC20 smart contract for Solidity',
    erc20Schema,
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
    }) => {
      const opts: KindedOptions['ERC20'] = {
        kind: 'ERC20',
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
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => erc20.print(opts)),
          },
        ],
      };
    },
  );
}
