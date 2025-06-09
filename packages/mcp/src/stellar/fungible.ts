import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-stellar';
import { fungible } from '@openzeppelin/wizard-stellar';
import { safePrint } from '../utils.js';
import { fungibleSchema } from './common/schemas.js';

export function registerStellarFungible(server: McpServer) {
 server.tool(
    'stellar-generate-fungible',
    'Generates a fungible token smart contract for Stellar, based on the Fungible Token Standard, compatible with SEP-41, similar to ERC-20. Returns the source code. Does not write to disk.',
    fungibleSchema,
    async ({
      name,
      symbol,
      burnable,
      pausable,
      premint,
      mintable,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['Fungible'] = {
        kind: 'Fungible',
        name,
        symbol,
        burnable,
        pausable,
        premint,
        mintable,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => fungible.print(opts)),
          },
        ],
      };
    },
  );
}
  