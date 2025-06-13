import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StablecoinOptions } from '@openzeppelin/wizard';
import { realWorldAsset } from '@openzeppelin/wizard';
import { safePrint } from '../../utils';
import { rwaSchema } from '../schemas';

export function registerSolidityRWA(server: McpServer) {
  return server.tool(
    'solidity-generate-rwa',
    '(Experimental) Generates a Real-World Asset smart contract for Solidity, and returns the source code. Does not write to disk.',
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
            text: safePrint(() => realWorldAsset.print(opts)),
          },
        ],
      };
    },
  );
}
