import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import type { KindedOptions } from '@openzeppelin/wizard';
import { erc20 } from '@openzeppelin/wizard';

// Create an MCP server
const server = new McpServer({
  name: 'OpenZeppelin Contracts Wizard',
  version: '0.0.1',
});

// Add an addition tool
server.tool(
  'generateERC20',
  {
    name: z.string(),
    symbol: z.string(),
    burnable: z.boolean(),
    pausable: z.boolean(),
    premint: z.string(),
    premintChainId: z.string(),
    mintable: z.boolean(),
    callback: z.boolean(),
    permit: z.boolean(),
    // votes: z.boolean().or(z.enum(['blocknumber', 'timestamp'])),
    // flashmint: z.boolean(),
    // crossChainBridging: z.literal(false).or(z.enum(['custom', 'superchain'])),
    // access: z.literal(false).or(z.enum(['ownable', 'roles', 'managed'])),
    // upgradeable: z.literal(false).or(z.enum(['transparent', 'uups'])),
    // info: z.object({
    //   securityContact: z.string().optional(),
    //   license: z.string().optional(),
    // }),
  },
  async ({
    name,
    symbol,
    burnable,
    pausable,
    premint,
    premintChainId,
    mintable,
    callback,
    permit,
    // votes,
    // flashmint,
    // crossChainBridging,
    // access,
    // upgradeable,
    // info,
  }) => {
    const opts: KindedOptions['ERC20'] = {
      kind: 'ERC20',
      name,
      symbol,
      burnable,
      pausable,
      premint,
      premintChainId,
      mintable,
      callback,
      permit,
      // votes,
      // flashmint,
      // crossChainBridging,
      // access,
      // upgradeable,
      // info,
    };
    return {
      content: [
        {
          type: 'text',
          text: erc20.print(opts),
        },
      ],
    };
  },
);

// Add a dynamic greeting resource
server.resource('greeting', new ResourceTemplate('greeting://{name}', { list: undefined }), async (uri, { name }) => ({
  contents: [
    {
      uri: uri.href,
      text: `Hello, ${name}!`,
    },
  ],
}));

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
})();
