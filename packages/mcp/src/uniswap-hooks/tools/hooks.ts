import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { hooks, type HooksOptions } from '@openzeppelin/wizard-uniswap-hooks';
import { uniswapHooksHooksSchema } from '@openzeppelin/wizard-common/schemas';
import { makeDetailedPrompt } from '../../utils';
import { uniswapHooksPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppPrintResult } from '../../apps/register';

export function registerUniswapHooks(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'uniswap-hooks',
    {
      description: makeDetailedPrompt(uniswapHooksPrompts.Hooks),
      inputSchema: uniswapHooksHooksSchema,
      title: 'Uniswap Hooks',
    },
    async ({
      hook,
      name,
      pausable,
      currencySettler,
      safeCast,
      transientStorage,
      shares,
      permissions,
      inputs,
      access,
      info,
    }) => {
      const opts: HooksOptions = {
        hook,
        name,
        pausable,
        currencySettler,
        safeCast,
        transientStorage,
        shares,
        permissions,
        inputs,
        access,
        info,
      };
      return wizardAppPrintResult(opts, () => hooks.print(opts), 'solidity');
    },
  );
}
