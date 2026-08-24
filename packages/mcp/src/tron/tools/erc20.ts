import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC20Options } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile, sanitizeTronOptions } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityERC20Schema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';
import { tronPrintResult } from '../print-result';

export function registerTronTRC20(server: McpServer): RegisteredTool {
  return server.tool(
    'tron-trc20',
    makeDetailedPrompt(tronPrompts.TRC20),
    solidityERC20Schema,
    async ({
      name,
      symbol,
      decimals,
      burnable,
      pausable,
      premint,
      premintChainId,
      mintable,
      callback,
      permit,
      votes,
      flashmint,
      crossChainBridging,
      crossChainLinkAllowOverride,
      access,
      upgradeable,
      info,
    }) => {
      const opts: ERC20Options = {
        name,
        symbol,
        decimals,
        burnable,
        pausable,
        premint,
        premintChainId,
        mintable,
        callback,
        permit,
        votes,
        flashmint,
        crossChainBridging,
        crossChainLinkAllowOverride,
        access,
        upgradeable,
        info,
      };
      return tronPrintResult(() =>
        printContract(buildGeneric(sanitizeTronOptions({ kind: 'ERC20', ...opts })), tronPrintProfile),
      );
    },
  );
}
