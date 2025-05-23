import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { KindedOptions } from '@openzeppelin/wizard';
import { custom } from '@openzeppelin/wizard';
import { safePrint } from './helpers.js';

export function registerSolidityCustom(server: McpServer) {
  server.tool(
    'solidityGenerateCustom',
    'Generate a Custom smart contract for Solidity',
    {
      name: z.string(),
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
      access,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['Custom'] = {
        kind: 'Custom',
        name,
        access,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => custom.print(opts)),
          },
        ],
      };
    },
  );
}
