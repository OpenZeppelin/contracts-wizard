import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MultisigOptions } from '@openzeppelin/wizard-cairo';
import { multisig } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { multisigSchema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoMultisig(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-multisig',
    makeDetailedPrompt(cairoPrompts.Multisig),
    multisigSchema,
    async ({ name, quorum, upgradeable, info, macros }) => {
      const opts: MultisigOptions = {
        name,
        quorum,
        upgradeable,
        info,
        macros,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintCairoCodeBlock(() => multisig.print(opts)),
          },
        ],
      };
    },
  );
}
