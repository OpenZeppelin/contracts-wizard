import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-stylus';
import { erc20 } from '@openzeppelin/wizard-stylus';
import { safePrint } from '../../utils.js';
import { erc20Schema } from '../schemas.js';

export function registerStylusERC20(server: McpServer) {
  server.tool(
    'stylus-generate-erc20',
    'Generates an ERC20 smart contract for Stylus, and returns the source code. Does not write to disk.',
    erc20Schema,
    async ({
      name,
      burnable,
      permit,
      flashmint,
      info,
    }) => {
      const opts: KindedOptions['ERC20'] = {
        kind: 'ERC20',
        name,
        burnable,
        permit,
        flashmint,
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
