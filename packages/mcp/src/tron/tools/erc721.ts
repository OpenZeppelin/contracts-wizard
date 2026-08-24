import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile, sanitizeTronOptions } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityERC721Schema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';
import { tronPrintResult } from '../print-result';

export function registerTronTRC721(server: McpServer): RegisteredTool {
  return server.tool(
    'tron-trc721',
    makeDetailedPrompt(tronPrompts.TRC721),
    solidityERC721Schema,
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
      return tronPrintResult(() =>
        printContract(buildGeneric(sanitizeTronOptions({ kind: 'ERC721', ...opts })), tronPrintProfile),
      );
    },
  );
}
