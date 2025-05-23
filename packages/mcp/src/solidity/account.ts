import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { KindedOptions } from '@openzeppelin/wizard';
import { account } from '@openzeppelin/wizard';
import { safePrint } from './helpers.js';

export function registerSolidityAccount(server: McpServer) {
  server.tool(
    'solidityGenerateAccount',
    'Generate an Account smart contract for Solidity. Experimental: Some features are not audited and are subject to change.',
    {
      name: z.string(),
      signatureValidation: z.literal(false).or(z.literal('ERC1271')).or(z.literal('ERC7739')).optional(),
      ERC721Holder: z.boolean().optional(),
      ERC1155Holder: z.boolean().optional(),
      signer: z.literal(false).or(z.literal('ERC7702')).or(z.literal('ECDSA')).or(z.literal('P256')).or(z.literal('RSA')).or(z.literal('Multisig')).or(z.literal('MultisigWeighted')).optional(),
      batchedExecution: z.boolean().optional(),
      ERC7579Modules: z.literal(false).or(z.literal('AccountERC7579')).or(z.literal('AccountERC7579Hooked')).optional(),
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
      signatureValidation,
      ERC721Holder,
      ERC1155Holder,
      signer,
      batchedExecution,
      ERC7579Modules,
      access,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['Account'] = {
        kind: 'Account',
        name,
        signatureValidation,
        ERC721Holder,
        ERC1155Holder,
        signer,
        batchedExecution,
        ERC7579Modules,
        access,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => account.print(opts)),
          },
        ],
      };
    },
  );
}
