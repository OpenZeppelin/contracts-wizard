import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC20Options } from '@openzeppelin/wizard-stylus';
import { erc20 } from '@openzeppelin/wizard-stylus';
import { makeDetailedPrompt } from '../../utils';
import { stylusERC20Schema } from '@openzeppelin/wizard-common/schemas';
import { stylusPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerStylusERC20(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stylus-erc20',
    {
      description: makeDetailedPrompt(stylusPrompts.ERC20),
      inputSchema: stylusERC20Schema,
      title: 'Stylus ERC20',
    },
    async ({ name, burnable, permit, flashmint, info }) => {
      const opts: ERC20Options = {
        name,
        burnable,
        permit,
        flashmint,
        info,
      };
      return wizardAppPrintResult(opts, () => erc20.print(opts), 'rust');
    },
  );
}
