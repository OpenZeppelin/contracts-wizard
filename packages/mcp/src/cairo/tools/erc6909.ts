import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC6909Options } from '@openzeppelin/wizard-cairo';
import { erc6909 } from '@openzeppelin/wizard-cairo';
import { makeDetailedPrompt } from '../../utils';
import { cairoERC6909Schema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerCairoERC6909(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-erc6909',
    {
      description: makeDetailedPrompt(cairoPrompts.ERC6909),
      inputSchema: cairoERC6909Schema,
      title: 'Cairo ERC6909',
    },
    async ({
      name,
      burnable,
      pausable,
      mintable,
      contentUri,
      tokenSupply,
      metadata,
      access,
      upgradeable,
      info,
      macros,
    }) => {
      const opts: ERC6909Options = {
        name,
        burnable,
        pausable,
        mintable,
        contentUri,
        tokenSupply,
        metadata,
        access,
        upgradeable,
        info,
        macros,
      };
      return wizardAppPrintResult(opts, () => erc6909.print(opts), 'cairo');
    },
  );
}
