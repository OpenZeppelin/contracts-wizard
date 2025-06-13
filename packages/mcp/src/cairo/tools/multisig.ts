import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo-alpha';
import { multisig } from '@openzeppelin/wizard-cairo-alpha';
import { safePrint } from '../../utils.js';
import { multisigSchema } from '../schemas.js';

export function registerCairoMultisig(server: McpServer) {
  server.tool(
    'cairo-generate-multisig',
    'Generates a Multisig smart contract for Cairo, and returns the source code. Does not write to disk.',
    multisigSchema,
    async ({
      name,
      quorum,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['Multisig'] = {
        kind: 'Multisig',
        name,
        quorum,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => multisig.print(opts)),
          },
        ],
      };
    },
  );
}
