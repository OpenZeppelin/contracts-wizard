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
  'Generate_ERC20_smart_contract_template',
  {
    name: z.string(),
    symbol: z.string(),
    burnable: z.boolean().optional(),
    pausable: z.boolean().optional(),
    premint: z.string().optional(),
    premintChainId: z.string().optional(),
    mintable: z.boolean().optional(),
    callback: z.boolean().optional(),
    permit: z.boolean().optional(),
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
