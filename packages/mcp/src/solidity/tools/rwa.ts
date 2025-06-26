import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard';
import { realWorldAsset } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { rwaSchema } from '../schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';

export function registerSolidityRWA(server: McpServer) {
  return server.tool(
    'solidity-rwa',
    makeDetailedPrompt(solidityPrompts.RWA),
    rwaSchema,
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
        info,
        limitations,
        custodian,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintSolidityCodeBlock(() => realWorldAsset.print(opts)),
          },
        ],
      };
    },
  );
}
