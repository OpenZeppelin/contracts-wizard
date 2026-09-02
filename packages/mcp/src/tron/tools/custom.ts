import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CustomOptions } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile } from '@openzeppelin/wizard';
import { makeDetailedPrompt } from '../../utils';
import { solidityCustomSchema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerTronCustom(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'tron-custom',
    {
      description: makeDetailedPrompt(tronPrompts.Custom),
      inputSchema: solidityCustomSchema,
      title: 'TRON Custom',
    },
    async ({ name, pausable, access, upgradeable, info }) => {
      const opts: CustomOptions = {
        name,
        pausable,
        access,
        upgradeable,
        info,
      };
      const tronOpts = { kind: 'Custom' as const, ...opts };
      return wizardAppPrintResult(tronOpts, () => printContract(buildGeneric(tronOpts), tronPrintProfile), 'solidity');
    },
  );
}
