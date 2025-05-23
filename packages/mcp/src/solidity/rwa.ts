import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { realWorldAsset } from '@openzeppelin/wizard';
import { safePrint } from './helpers.js';
import { stablecoinSchema } from './stablecoin.js';

const rwaSchema = stablecoinSchema;

export function registerSolidityRWA(server: McpServer) {
  server.tool(
    'solidityGenerateRealWorldAsset',
    'Generate a Real World Asset smart contract for Solidity. Experimental: Some features are not audited and are subject to change.',
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
