import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { hooks, type HooksOptions } from '@openzeppelin/wizard-uniswap-hooks';
import { uniswapHooksHooksSchema } from '@openzeppelin/wizard-common/schemas';
import { makeDetailedPrompt, safePrintSolidityCodeBlock } from '../../utils';
import { uniswapHooksPrompts } from '@openzeppelin/wizard-common';
import { registerWizardAppTool, wizardAppResult } from '../../apps/register';

export function registerUniswapHooks(server: McpServer): RegisteredTool {
  return registerWizardAppTool(
    server,
    'uniswap-hooks',
    {
      description: makeDetailedPrompt(uniswapHooksPrompts.Hooks),
      inputSchema: uniswapHooksHooksSchema,
      languageApp: 'uniswap-hooks',
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
      try {
        const code = hooks.print(opts);
        return wizardAppResult(opts, safePrintSolidityCodeBlock(() => code), code);
      } catch {
        return wizardAppResult(opts, safePrintSolidityCodeBlock(() => hooks.print(opts)), undefined, true);
      }
    },
  );
}
