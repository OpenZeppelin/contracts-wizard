import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-stylus';
import { erc721 } from '@openzeppelin/wizard-stylus';
import { safePrint } from '../../utils.js';
import { erc721Schema } from '../schemas.js';

export function registerStylusERC721(server: McpServer) {
  server.tool(
    'stylus-generate-erc721',
    'Generates an ERC721 smart contract for Stylus, and returns the source code. Does not write to disk.',
    erc721Schema,
    async ({
      name,
      burnable,
      enumerable,
      info,
    }) => {
      const opts: KindedOptions['ERC721'] = {
        kind: 'ERC721',
        name,
        burnable,
        enumerable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => erc721.print(opts)),
          },
        ],
      };
    },
  );
}
