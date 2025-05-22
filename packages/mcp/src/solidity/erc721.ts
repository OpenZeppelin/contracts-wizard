import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { KindedOptions } from '@openzeppelin/wizard';
import { erc721, OptionsError } from '@openzeppelin/wizard';

export function registerSolidityERC721(server: McpServer) {
  server.tool(
    'solidityGenerateERC721',
    'Generate an ERC721 smart contract for Solidity',
    {
      name: z.string(),
      symbol: z.string(),
      baseUri: z.string().optional(),
      enumerable: z.boolean().optional(),
      uriStorage: z.boolean().optional(),
      burnable: z.boolean().optional(),
      pausable: z.boolean().optional(),
      mintable: z.boolean().optional(),
      incremental: z.boolean().optional(),
      votes: z.literal('blocknumber').or(z.literal('timestamp')).optional(),
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
      symbol,
      baseUri,
      enumerable,
      uriStorage,
      burnable,
      pausable,
      mintable,
      incremental,
      votes,
      access,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['ERC721'] = {
        kind: 'ERC721',
        name,
        symbol,
        baseUri,
        enumerable,
        uriStorage,
        burnable,
        pausable,
        mintable,
        incremental,
        votes,
        access,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(opts),
          },
        ],
      };
    },
  );
}

function safePrint(opts: KindedOptions['ERC721']): string {
  try {
    return erc721.print(opts);
  } catch (e) {
    if (e instanceof OptionsError) {
      return `${e.message}\n\n${JSON.stringify(e.messages, null, 2)}`;
    } else {
      return `Unexpected error: ${e}`;
    }
  }
}
