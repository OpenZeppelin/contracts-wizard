import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard';
import { stablecoin } from '@openzeppelin/wizard';
import { safePrint, makeDetailedPrompt } from '../../utils';
import { stablecoinSchema } from '../schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';

export function registerSolidityStablecoin(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-stablecoin',
    makeDetailedPrompt(solidityPrompts.Stablecoin),
    stablecoinSchema,
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
      access,
      upgradeable,
      info,
      limitations,
      custodian,
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
        access,
        upgradeable,
        info,
        limitations,
        custodian,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => stablecoin.print(opts)),
          },
        ],
      };
    },
  );
}
