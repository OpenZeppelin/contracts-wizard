import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard-cairo';
import { erc721 } from '@openzeppelin/wizard-cairo';
import { makeDetailedPrompt } from '../../utils';
import { cairoERC721Schema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerCairoERC721(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-erc721',
    {
      description: makeDetailedPrompt(cairoPrompts.ERC721),
      inputSchema: cairoERC721Schema,
      title: 'Cairo ERC721',
    },
    async ({
      name,
      symbol,
      baseUri,
      burnable,
      pausable,
      mintable,
      enumerable,
      wrapper,
      uriStorage,
      votes,
      consecutive,
      royaltyInfo,
      appName,
      appVersion,
      access,
      upgradeable,
      info,
      macros,
    }) => {
      const opts: ERC721Options = {
        name,
        symbol,
        baseUri,
        burnable,
        pausable,
        mintable,
        enumerable,
        wrapper,
        uriStorage,
        votes,
        consecutive,
        royaltyInfo,
        appName,
        appVersion,
        access,
        upgradeable,
        info,
        macros,
      };
      return wizardAppPrintResult(opts, () => erc721.print(opts), 'cairo');
    },
  );
}
