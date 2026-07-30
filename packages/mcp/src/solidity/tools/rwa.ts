import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard';
import { realWorldAsset } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityRWASchema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerSolidityRWA(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'solidity-rwa',
    {
      description: makeDetailedPrompt(solidityPrompts.RWA),
      inputSchema: solidityRWASchema,
      title: 'Solidity RWA',
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
      info,
      restrictions,
      freezable,
    }) => {
      const opts: StablecoinOptions = {
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
        info,
        restrictions,
        freezable,
      };
      return wizardAppPrintResult(opts, () => realWorldAsset.print(opts), 'solidity');
    },
  );
}
