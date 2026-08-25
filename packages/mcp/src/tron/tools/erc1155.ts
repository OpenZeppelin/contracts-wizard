import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC1155Options } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile, sanitizeTronOptions } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityERC1155Schema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerTronTRC1155(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'tron-trc1155',
    {
      description: makeDetailedPrompt(tronPrompts.TRC1155),
      inputSchema: solidityERC1155Schema,
      title: 'TRON TRC1155',
    },
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
      const tronOpts = sanitizeTronOptions({ kind: 'ERC1155' as const, ...opts });
      return wizardAppPrintResult(tronOpts, () => printContract(buildGeneric(tronOpts), tronPrintProfile), 'solidity');
    },
  );
}
