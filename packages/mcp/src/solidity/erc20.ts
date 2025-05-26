import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { erc20 } from '@openzeppelin/wizard';
import { safePrint } from './common/helpers.js';
import { erc20Schema } from './common/schemas.js';

export function registerSolidityERC20(server: McpServer) {
  server.tool(
    'solidity-generate-erc20',
    'Generates an ERC20 smart contract for Solidity, and returns the source code. Does not write to disk.',
    erc20Schema,
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
    }) => {
      const opts: KindedOptions['ERC20'] = {
        kind: 'ERC20',
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
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => erc20.print(opts)),
          },
        ],
      };
    },
  );
}
