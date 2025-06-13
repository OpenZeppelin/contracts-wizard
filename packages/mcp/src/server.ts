import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityTools } from './solidity/tools.js';
import { registerCairoTools } from './cairo/register-tools.js';
import { registerStellarTools } from './stellar/register-tools.js';
import { registerStylusTools } from './stylus/register-tools.js';
import { version } from '../package.json';

export function createServer() {
  const server = new McpServer(
    {
      name: 'OpenZeppelin Contracts Wizard',
      version,
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
