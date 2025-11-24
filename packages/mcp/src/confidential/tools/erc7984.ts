import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC7984Options } from '@openzeppelin/wizard-confidential';
import { erc7984 } from '@openzeppelin/wizard-confidential';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { erc7984Schema } from '../schemas';
import { confidentialPrompts } from '@openzeppelin/wizard-common';

export function registerConfidentialERC7984(server: McpServer): RegisteredTool {
  return server.tool(
    'erc7984',
    makeDetailedPrompt(confidentialPrompts.ERC7984),
    erc7984Schema,
    async ({ name, symbol, contractURI, premint, networkConfig, wrappable, votes, info }) => {
      const opts: ERC7984Options = {
        name,
        symbol,
        contractURI,
        premint,
        networkConfig,
        wrappable,
        votes,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintSolidityCodeBlock(() => erc7984.print(opts)),
          },
        ],
      };
    },
  );
}
