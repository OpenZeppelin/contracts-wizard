import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import { custom } from '@openzeppelin/wizard';
import { safePrint } from './common/helpers.js';
import { customSchema } from './common/schemas.js';

export function registerSolidityCustom(server: McpServer) {
  server.tool(
    'solidity-generate-custom',
    'Generates a Custom smart contract for Solidity, and returns the source code. Does not write to disk.',
    customSchema,
    async ({
      name,
      access,
      upgradeable,
      info,
    }) => {
      const opts: KindedOptions['Custom'] = {
        kind: 'Custom',
        name,
        access,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrint(() => custom.print(opts)),
          },
        ],
      };
    },
  );
}
