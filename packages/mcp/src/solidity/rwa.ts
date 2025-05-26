import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { realWorldAsset } from '@openzeppelin/wizard';
import { safePrint } from './common/helpers.js';
import { rwaSchema } from './common/schemas.js';

export function registerSolidityRWA(server: McpServer) {
  server.tool(
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
      const opts: KindedOptions['RealWorldAsset'] = {
        kind: 'RealWorldAsset',
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
