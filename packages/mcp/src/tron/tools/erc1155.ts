import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile, sanitizeTronOptions } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityERC1155Schema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';
import { tronPrintResult } from '../print-result';

export function registerTronTRC1155(server: McpServer): RegisteredTool {
  return server.tool(
    'tron-trc1155',
    makeDetailedPrompt(tronPrompts.TRC1155),
    solidityERC1155Schema,
    async ({
      name,
      uri,
      burnable,
      pausable,
      mintable,
      supply,
      updatableUri,
      crossChainBridging,
      crossChainLinkAllowOverride,
      access,
      upgradeable,
      info,
    }) => {
      const opts: ERC1155Options = {
        name,
        uri,
        burnable,
        pausable,
        mintable,
        supply,
        updatableUri,
        crossChainBridging,
        crossChainLinkAllowOverride,
        access,
        upgradeable,
        info,
      };
      return tronPrintResult(() =>
        printContract(buildGeneric(sanitizeTronOptions({ kind: 'ERC1155', ...opts })), tronPrintProfile),
      );
    },
  );
}
