import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard-stylus';
import { erc721 } from '@openzeppelin/wizard-stylus';
import { safePrintRustCodeBlock, makeDetailedPrompt } from '../../utils';
import { stylusERC721Schema } from '@openzeppelin/wizard-common/schemas';
import { stylusPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerStylusERC721(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'stylus-erc721',
    {
      description: makeDetailedPrompt(stylusPrompts.ERC721),
      inputSchema: stylusERC721Schema,
      title: 'Stylus ERC721',
    },
    async ({ name, burnable, enumerable, info }) => {
      const opts: ERC721Options = {
        name,
        burnable,
        enumerable,
        info,
      };
      try {
        const code = erc721.print(opts);
        return wizardAppResult(opts, safePrintRustCodeBlock(() => code), code);
      } catch {
        return wizardAppResult(opts, safePrintRustCodeBlock(() => erc721.print(opts)), undefined, true);
      }
    },
  );
}
