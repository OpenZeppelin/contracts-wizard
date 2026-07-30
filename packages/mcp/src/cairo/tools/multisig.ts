import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MultisigOptions } from '@openzeppelin/wizard-cairo';
import { multisig } from '@openzeppelin/wizard-cairo';
import { makeDetailedPrompt } from '../../utils';
import { cairoMultisigSchema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerCairoMultisig(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-multisig',
    {
      description: makeDetailedPrompt(cairoPrompts.Multisig),
      inputSchema: cairoMultisigSchema,
      title: 'Cairo Multisig',
    },
    async ({ name, quorum, upgradeable, info, macros }) => {
      const opts: MultisigOptions = {
        name,
        quorum,
        upgradeable,
        info,
        macros,
      };
      return wizardAppPrintResult(opts, () => multisig.print(opts), 'cairo');
    },
  );
}
