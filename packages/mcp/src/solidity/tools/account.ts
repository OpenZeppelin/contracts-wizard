import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AccountOptions } from '@openzeppelin/wizard';
import { account } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityAccountSchema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerSolidityAccount(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'solidity-account',
    {
      description: makeDetailedPrompt(solidityPrompts.Account),
      inputSchema: solidityAccountSchema,
      title: 'Solidity Account',
    },
    async ({
      name,
      signatureValidation,
      ERC721Holder,
      ERC1155Holder,
      signer,
      batchedExecution,
      ERC7579Modules,
      info,
      upgradeable,
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
        upgradeable,
      };
      return wizardAppPrintResult(opts, () => account.print(opts), 'solidity');
    },
  );
}
