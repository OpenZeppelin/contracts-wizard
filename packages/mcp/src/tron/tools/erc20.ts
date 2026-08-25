import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC20Options } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile, sanitizeTronOptions } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityERC20Schema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerTronTRC20(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'tron-trc20',
    {
      description: makeDetailedPrompt(tronPrompts.TRC20),
      inputSchema: solidityERC20Schema,
      title: 'TRON TRC20',
    },
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
      const tronOpts = sanitizeTronOptions({ kind: 'ERC20' as const, ...opts });
      return wizardAppPrintResult(tronOpts, () => printContract(buildGeneric(tronOpts), tronPrintProfile), 'solidity');
    },
  );
}
