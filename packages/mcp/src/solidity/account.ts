import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { account } from '@openzeppelin/wizard';
import { safePrint } from './common/helpers.js';
import { accountSchema } from './common/schemas.js';

export function registerSolidityAccount(server: McpServer) {
  server.tool(
    'solidity-generate-account',
    'Generate an Account smart contract for Solidity (Experimental: Some features are not audited and are subject to change)',
    accountSchema,
    async ({
      name,
      signatureValidation,
      ERC721Holder,
      ERC1155Holder,
      signer,
      batchedExecution,
      ERC7579Modules,
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
