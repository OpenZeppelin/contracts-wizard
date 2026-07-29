import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard';
import { stablecoin } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityStablecoinSchema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerSolidityStablecoin(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'solidity-stablecoin',
    {
      description: makeDetailedPrompt(solidityPrompts.Stablecoin),
      inputSchema: solidityStablecoinSchema,
      title: 'Solidity Stablecoin',
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
      try {
        const code = stablecoin.print(opts);
        return wizardAppResult(opts, safePrintSolidityCodeBlock(() => code), code);
      } catch {
        return wizardAppResult(opts, safePrintSolidityCodeBlock(() => stablecoin.print(opts)), undefined, true);
      }
    },
  );
}
