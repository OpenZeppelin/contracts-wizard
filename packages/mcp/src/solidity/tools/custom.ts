import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CustomOptions } from '@openzeppelin/wizard';
import { custom } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityCustomSchema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerSolidityCustom(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'solidity-custom',
    {
      description: makeDetailedPrompt(solidityPrompts.Custom),
      inputSchema: solidityCustomSchema,
      title: 'Solidity Custom',
    },
    async ({ name, pausable, access, upgradeable, info }) => {
      const opts: CustomOptions = {
        name,
        pausable,
        access,
        upgradeable,
        info,
      };
      try {
        const code = custom.print(opts);
        return wizardAppResult(
          opts,
          safePrintSolidityCodeBlock(() => code),
          code,
        );
      } catch {
        return wizardAppResult(
          opts,
          safePrintSolidityCodeBlock(() => custom.print(opts)),
          undefined,
          true,
        );
      }
    },
  );
}
