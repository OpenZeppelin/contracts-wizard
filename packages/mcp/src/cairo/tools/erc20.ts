import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC20Options } from '@openzeppelin/wizard-cairo';
import { erc20 } from '@openzeppelin/wizard-cairo';
import { makeDetailedPrompt } from '../../utils';
import { cairoERC20Schema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerCairoERC20(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-erc20',
    {
      description: makeDetailedPrompt(cairoPrompts.ERC20),
      inputSchema: cairoERC20Schema,
      title: 'Cairo ERC20',
    },
    async ({
      name,
      symbol,
      decimals,
      burnable,
      pausable,
      premint,
      mintable,
      votes,
      appName,
      appVersion,
      access,
      upgradeable,
      info,
      macros,
    }) => {
      const opts: ERC20Options = {
        name,
        symbol,
        decimals,
        burnable,
        pausable,
        premint,
        mintable,
        votes,
        appName,
        appVersion,
        access,
        upgradeable,
        info,
        macros,
      };
      return wizardAppPrintResult(opts, () => erc20.print(opts), 'cairo');
    },
  );
}
