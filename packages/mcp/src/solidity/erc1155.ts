import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { KindedOptions } from '@openzeppelin/wizard';
import { erc1155 } from '@openzeppelin/wizard';
import { safePrint } from './helpers.js';

export function registerSolidityERC1155(server: McpServer) {
  server.tool(
    'solidityGenerateERC1155',
    'Generate an ERC1155 smart contract for Solidity',
    {
      name: z.string(),
      uri: z.string(),
      burnable: z.boolean().optional(),
      pausable: z.boolean().optional(),
      mintable: z.boolean().optional(),
      supply: z.boolean().optional(),
      updatableUri: z.boolean().optional(),
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
      uri,
      burnable,
      pausable,
      mintable,
      supply,
      updatableUri,
      access,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['ERC1155'] = {
        kind: 'ERC1155',
        name,
        uri,
        burnable,
        pausable,
        mintable,
        supply,
        updatableUri,
        access,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => erc1155.print(opts)),
          },
        ],
      };
    },
  );
}
