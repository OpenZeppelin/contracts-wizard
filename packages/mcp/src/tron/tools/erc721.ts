import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile, sanitizeTronOptions } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityERC721Schema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerTronTRC721(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'tron-trc721',
    {
      description: makeDetailedPrompt(tronPrompts.TRC721),
      inputSchema: solidityERC721Schema,
      title: 'TRON TRC721',
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
      crossChainBridging,
      crossChainLinkAllowOverride,
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
        crossChainBridging,
        crossChainLinkAllowOverride,
        access,
        upgradeable,
        namespacePrefix,
        info,
      };
      const tronOpts = sanitizeTronOptions({ kind: 'ERC721' as const, ...opts });
      return wizardAppPrintResult(tronOpts, () => printContract(buildGeneric(tronOpts), tronPrintProfile), 'solidity');
    },
  );
}
