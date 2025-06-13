import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo-alpha';
import { multisig } from '@openzeppelin/wizard-cairo-alpha';
import { safePrint, makeDetailedPrompt } from '../../utils';
import { multisigSchema } from '../schemas';
import { cairoPrompts } from '@ericglau/wizard-common';

export function registerCairoMultisig(server: McpServer) {
  server.tool(
    'cairo-multisig',
    makeDetailedPrompt(cairoPrompts.Multisig),
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
