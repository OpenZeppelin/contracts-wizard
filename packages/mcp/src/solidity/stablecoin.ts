import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { stablecoin } from '@openzeppelin/wizard';
import { safePrint } from './common/helpers.js';
import { stablecoinSchema } from './common/schemas.js';

export function registerSolidityStablecoin(server: McpServer) {
  server.tool(
    'solidity-generate-stablecoin',
    'Generate a Stablecoin smart contract for Solidity (Experimental: Some features are not audited and are subject to change)',
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
      const opts: KindedOptions['Stablecoin'] = {
        kind: 'Stablecoin',
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
