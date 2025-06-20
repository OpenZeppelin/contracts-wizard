import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC20Options } from '@openzeppelin/wizard-cairo';
import { erc20 } from '@openzeppelin/wizard-cairo';
import { safePrintCairoCodeBlock, makeDetailedPrompt } from '../../utils';
import { erc20Schema } from '../schemas';
import { cairoPrompts } from '@openzeppelin/wizard-common';

export function registerCairoERC20(server: McpServer): RegisteredTool {
  return server.tool(
    'cairo-erc20',
    makeDetailedPrompt(cairoPrompts.ERC20),
    erc20Schema,
    async ({
      name,
      symbol,
      burnable,
      pausable,
      premint,
      mintable,
      votes,
      appName,
      appVersion,
      access,
      upgradeable,
      info,
    }) => {
      const opts: ERC20Options = {
        name,
        symbol,
        burnable,
        pausable,
        premint,
        mintable,
        votes,
        appName,
        appVersion,
        access,
        upgradeable,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintCairoCodeBlock(() => erc20.print(opts)),
          },
        ],
      };
    },
  );
}
