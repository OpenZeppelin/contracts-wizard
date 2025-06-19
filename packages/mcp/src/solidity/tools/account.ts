import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AccountOptions } from '@openzeppelin/wizard';
import { account } from '@openzeppelin/wizard';
import { safePrintCodeBlock, makeDetailedPrompt } from '../../utils';
import { accountSchema } from '../schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';

export function registerSolidityAccount(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-account',
    makeDetailedPrompt(solidityPrompts.Account),
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
            text: safePrintCodeBlock(() => account.print(opts)),
          },
        ],
      };
    },
  );
}
