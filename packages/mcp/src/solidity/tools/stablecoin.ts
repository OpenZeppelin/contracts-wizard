import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { stablecoin } from '@openzeppelin/wizard';
import { safePrint } from '../../utils';
import { stablecoinSchema } from '../schemas';

export function registerSolidityStablecoin(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-generate-stablecoin',
    '(Experimental) Generates a Stablecoin smart contract for Solidity, and returns the source code. Does not write to disk.',
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
