import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityTools } from './solidity/common/register.js';
import { registerCairoTools } from './cairo/common/register.js';
import { registerStellarTools } from './stellar/common/register.js';
import { registerStylusTools } from './stylus/common/register.js';

export function createServer() {
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

  registerSolidityTools(server);
  registerCairoTools(server);
  registerStellarTools(server);
  registerStylusTools(server);

  return server;
}
