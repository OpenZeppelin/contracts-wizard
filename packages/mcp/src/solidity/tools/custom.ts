import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CustomOptions } from '@openzeppelin/wizard';
import { custom } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityCustomSchema } from '@openzeppelin/wizard-common/schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

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
      return wizardAppPrintResult(opts, () => custom.print(opts), 'solidity');
    },
  );
}
