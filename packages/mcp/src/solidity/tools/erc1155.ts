import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard';
import { erc1155 } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityERC1155Schema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerSolidityERC1155(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'solidity-erc1155',
    {
      description: makeDetailedPrompt(solidityPrompts.ERC1155),
      inputSchema: solidityERC1155Schema,
      title: 'Solidity ERC1155',
    },
    async ({ name, uri, burnable, pausable, mintable, supply, updatableUri, access, upgradeable, info }) => {
      const opts: ERC1155Options = {
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
      try {
        const code = erc1155.print(opts);
        return wizardAppResult(
          opts,
          safePrintSolidityCodeBlock(() => code),
          code,
        );
      } catch {
        return wizardAppResult(
          opts,
          safePrintSolidityCodeBlock(() => erc1155.print(opts)),
          undefined,
          true,
        );
      }
    },
  );
}
