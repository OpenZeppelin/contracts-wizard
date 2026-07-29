import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC20Options } from '@openzeppelin/wizard';
import { erc20 } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityERC20Schema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerSolidityERC20(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'solidity-erc20',
    {
      description: makeDetailedPrompt(solidityPrompts.ERC20),
      inputSchema: solidityERC20Schema,
      title: 'Solidity ERC20',
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
      try {
        const code = erc20.print(opts);
        return wizardAppResult(
          opts,
          safePrintSolidityCodeBlock(() => code),
          code,
        );
      } catch {
        return wizardAppResult(
          opts,
          safePrintSolidityCodeBlock(() => erc20.print(opts)),
          undefined,
          true,
        );
      }
    },
  );
}
