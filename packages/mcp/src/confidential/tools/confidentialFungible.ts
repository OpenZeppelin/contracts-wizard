import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ConfidentialFungibleOptions } from '@openzeppelin/wizard-confidential';
import { confidentialFungible } from '@openzeppelin/wizard-confidential';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { confidentialFungibleSchema } from '../schemas';
import { confidentialPrompts } from '@openzeppelin/wizard-common';

export function registerConfidentialConfidentialFungible(server: McpServer): RegisteredTool {
  return server.tool(
    'confidential-confidential-fungible',
    makeDetailedPrompt(confidentialPrompts.ConfidentialFungible),
    confidentialFungibleSchema,
    async ({
      name,
      symbol,
      tokenURI,
      premint,
      networkConfig,
      wrappable,
      votes,
      info,
    }) => {
      const opts: ConfidentialFungibleOptions = {
        name,
        symbol,
        tokenURI,
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
            text: safePrintSolidityCodeBlock(() => confidentialFungible.print(opts)),
          },
        ],
      };
    },
  );
}
