import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerSolidityERC20 } from './solidity';

// Create an MCP server
const server = new McpServer(
  {
    name: 'OpenZeppelin Contracts Wizard',
    version: '0.0.1',
  },
  {
    instructions: `\
Whenever the user asks to create or modify a smart contract using OpenZeppelin Contracts, use these tools to determine the recommended patterns.
Toggle the options in the tool to determine how different features affect the code, and apply the same types of changes to the user's contract.
`,
  },
);

registerSolidityERC20(server);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
})();
