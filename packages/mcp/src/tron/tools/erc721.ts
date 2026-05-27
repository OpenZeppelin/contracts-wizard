import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ERC721Options } from '@openzeppelin/wizard';
import { erc721, rewriteForTron } from '@openzeppelin/wizard';
import { safePrintSolidityCodeBlock, makeDetailedPrompt } from '../../utils';
import { solidityERC721Schema } from '@openzeppelin/wizard-common/schemas';
import { tronPrompts } from '@openzeppelin/wizard-common';

export function registerTronTRC721(server: McpServer): RegisteredTool {
  return server.tool(
    'tron-trc721',
    makeDetailedPrompt(tronPrompts.TRC721),
    solidityERC721Schema,
    async ({
      name,
      symbol,
      baseUri,
      enumerable,
      uriStorage,
      burnable,
      pausable,
      mintable,
      incremental,
      votes,
      access,
      upgradeable,
      namespacePrefix,
      info,
    }) => {
      const opts: ERC721Options = {
        name,
        symbol,
        baseUri,
        enumerable,
        uriStorage,
        burnable,
        pausable,
        mintable,
        incremental,
        votes,
        access,
        upgradeable,
        namespacePrefix,
        info,
      };
      return {
        content: [
          {
            type: 'text',
            text: safePrintSolidityCodeBlock(() => rewriteForTron(erc721.print(opts))),
          },
        ],
      };
    },
  );
}
