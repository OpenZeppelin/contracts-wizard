import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo-alpha';
import { erc20 } from '@openzeppelin/wizard-cairo-alpha';
import { safePrint } from '../../utils.js';
import { erc20Schema } from '../schemas.js';
import { cairoPrompts } from '@ericglau/wizard-common';

export function registerCairoERC20(server: McpServer) {
  server.tool(
    'cairo-erc20',
    cairoPrompts.ERC20,
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
