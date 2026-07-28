import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard-cairo';
import { erc1155 } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { cairoERC1155Schema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerCairoERC1155(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-erc1155',
    {
      description: makeDetailedPrompt(cairoPrompts.ERC1155),
      inputSchema: cairoERC1155Schema,
      languageApp: 'cairo-erc1155',
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
      try {
        const code = erc1155.print(opts);
        return wizardAppResult(opts, safePrintCairoCodeBlock(() => code), code);
      } catch {
        return wizardAppResult(opts, safePrintCairoCodeBlock(() => erc1155.print(opts)), undefined, true);
      }
    },
  );
}
