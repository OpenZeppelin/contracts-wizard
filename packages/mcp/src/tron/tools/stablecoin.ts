import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard';
import { stablecoin, rewriteForTron, sanitizeTronOptions } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityStablecoinSchema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';

export function registerTronStablecoin(server: McpServer): RegisteredTool {
  return server.tool(
    'tron-stablecoin',
    makeDetailedPrompt(tronPrompts.Stablecoin),
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
            text: safePrintSolidityCodeBlock(() => rewriteForTron(stablecoin.print(sanitizeTronOptions(opts)))),
          },
        ],
      };
    },
  );
}
