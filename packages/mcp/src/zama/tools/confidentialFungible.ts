import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ConfidentialFungibleOptions } from '@openzeppelin/wizard-zama';
import { confidentialFungible } from '@openzeppelin/wizard-zama';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { confidentialFungibleSchema } from '../schemas';
import { zamaPrompts } from '@openzeppelin/wizard-common';

export function registerZamaConfidentialFungible(server: McpServer): RegisteredTool {
  return server.tool(
    'zama-confidential-fungible',
    makeDetailedPrompt(zamaPrompts.ConfidentialFungible),
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
