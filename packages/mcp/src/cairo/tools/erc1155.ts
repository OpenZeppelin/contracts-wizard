import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard-cairo';
import { erc1155 } from '@openzeppelin/wizard-cairo';
import { makeDetailedPrompt } from '../../utils';
import { cairoERC1155Schema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerCairoERC1155(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-erc1155',
    {
      description: makeDetailedPrompt(cairoPrompts.ERC1155),
      inputSchema: cairoERC1155Schema,
      title: 'Cairo ERC1155',
    },
    async ({
      name,
      baseUri,
      burnable,
      pausable,
      mintable,
      updatableUri,
      royaltyInfo,
      access,
      upgradeable,
      info,
      macros,
    }) => {
      const opts: ERC1155Options = {
        name,
        baseUri,
        burnable,
        pausable,
        mintable,
        updatableUri,
        royaltyInfo,
        access,
        upgradeable,
        info,
        macros,
      };
      return wizardAppPrintResult(opts, () => erc1155.print(opts), 'cairo');
    },
  );
}
