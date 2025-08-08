import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC7579Options } from '@openzeppelin/wizard';
import { erc7579 } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { erc7579Schema } from '../schemas';
import { solidityPrompts } from '@openzeppelin/wizard-common';

export function registerSolidityERC7579(server: McpServer): RegisteredTool {
  return server.tool(
    'solidity-erc7579',
    makeDetailedPrompt(solidityPrompts.ERC7579),
    erc7579Schema,
    async ({ name, validator, executor, hook, fallback, info }) => {
      const opts: ERC7579Options = {
        name,
        validator,
        executor,
        hook,
        fallback,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintSolidityCodeBlock(() => erc7579.print(opts)),
          },
        ],
      };
    },
  );
}
