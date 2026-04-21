import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard';
import { stablecoin } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityStablecoinSchema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';

export function registerSolidityStablecoin(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-stablecoin',
    makeDetailedPrompt(solidityPrompts.Stablecoin),
    solidityStablecoinSchema,
    async ({
      name,
      symbol,
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
      return {
        content: [
          {
            type: 'text',
            text: safePrintSolidityCodeBlock(() => stablecoin.print(opts)),
          },
        ],
      };
    },
  );
}
