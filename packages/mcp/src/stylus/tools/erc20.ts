import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC20Options } from '@openzeppelin/wizard-stylus';
import { erc20 } from '@openzeppelin/wizard-stylus';
import { safePrint } from '../../utils';
import { erc20Schema } from '../schemas';

export function registerStylusERC20(server: McpServer): RegisteredTool {
  return server.tool(
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
      const opts: ERC20Options = {
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
