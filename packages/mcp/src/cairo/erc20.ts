import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import { erc20 } from '@openzeppelin/wizard-cairo';
import { safePrint } from '../utils.js';
import { erc20Schema } from './common/schemas.js';

export function registerCairoERC20(server: McpServer) {
  server.tool(
    'cairo-generate-erc20',
    'Generates an ERC20 smart contract for Cairo, and returns the source code. Does not write to disk.',
    erc20Schema,
    async ({
      name,
      symbol,
      burnable,
      pausable,
      premint,
      mintable,
      votes,
      appName,
      appVersion,
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
        mintable,
        votes,
        appName,
        appVersion,
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
