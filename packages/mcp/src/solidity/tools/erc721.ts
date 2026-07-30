import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard';
import { erc721 } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityERC721Schema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerSolidityERC721(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'solidity-erc721',
    {
      description: makeDetailedPrompt(solidityPrompts.ERC721),
      inputSchema: solidityERC721Schema,
      title: 'Solidity ERC721',
    },
    async ({
      name,
      symbol,
      baseUri,
      enumerable,
      uriStorage,
      burnable,
      pausable,
      mintable,
      incremental,
      votes,
      access,
      upgradeable,
      namespacePrefix,
      info,
    }) => {
      const opts: ERC721Options = {
        name,
        symbol,
        baseUri,
        enumerable,
        uriStorage,
        burnable,
        pausable,
        mintable,
        incremental,
        votes,
        access,
        upgradeable,
        namespacePrefix,
        info,
      };
      return wizardAppPrintResult(opts, () => erc721.print(opts), 'solidity');
    },
  );
}
