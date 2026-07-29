import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard-stylus';
import { erc1155 } from '@openzeppelin/wizard-stylus';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stylusERC1155Schema } from '@openzeppelin/wizard-common/schemas';
import { stylusPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerStylusERC1155(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stylus-erc1155',
    {
      description: makeDetailedPrompt(stylusPrompts.ERC1155),
      inputSchema: stylusERC1155Schema,
      title: 'Stylus ERC1155',
    },
    async ({ name, burnable, supply, info }) => {
      const opts: ERC1155Options = {
        name,
        burnable,
        supply,
        info,
      };
      try {
        const code = erc1155.print(opts);
        return wizardAppResult(
          opts,
          safePrintRustCodeBlock(() => code),
          code,
        );
      } catch {
        return wizardAppResult(
          opts,
          safePrintRustCodeBlock(() => erc1155.print(opts)),
          undefined,
          true,
        );
      }
    },
  );
}
