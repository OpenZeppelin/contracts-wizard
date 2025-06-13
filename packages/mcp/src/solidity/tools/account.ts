import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AccountOptions } from '@openzeppelin/wizard';
import { account } from '@openzeppelin/wizard';
import { safePrint } from '../../utils';
import { accountSchema } from '../schemas';

export function registerSolidityAccount(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-generate-account',
    '(Experimental) Generates an Account smart contract for Solidity, and returns the source code. Does not write to disk.',
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
      const opts: AccountOptions = {
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
