import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CustomOptions } from '@openzeppelin/wizard-cairo';
import { custom } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { cairoCustomSchema } from '@openzeppelin/wizard-common/schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerCairoCustom(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'cairo-custom',
    {
      description: makeDetailedPrompt(cairoPrompts.Custom),
      inputSchema: cairoCustomSchema,
      title: 'Cairo Custom',
    },
    async ({ name, pausable, access, upgradeable, info, macros }) => {
      const opts: CustomOptions = {
        name,
        pausable,
        access,
        upgradeable,
        info,
        macros,
      };
      try {
        const code = custom.print(opts);
        return wizardAppResult(opts, safePrintCairoCodeBlock(() => code), code);
      } catch {
        return wizardAppResult(opts, safePrintCairoCodeBlock(() => custom.print(opts)), undefined, true);
      }
    },
  );
}
