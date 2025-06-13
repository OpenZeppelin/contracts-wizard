import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityTools } from './solidity/tools.js';
import { registerCairoTools } from './cairo/tools.js';
import { registerStellarTools } from './stellar/tools.js';
import { registerStylusTools } from './stylus/tools.js';
import { version } from '../package.json';

export function createServer() {
  const server = new McpServer(
    {
      name: 'OpenZeppelin Contracts Wizard',
      version,
    },
    {
      instructions: `\
Tools are provided for different smart contract languages: Solidity, Starknet's Cairo, Stellar Soroban, and Arbitrum Stylus.
Each tool generates a smart contract using recommended best practices with OpenZeppelin Contracts libraries, and returns the source code. The tools do not write to disk.
If the user requests to create a new smart contract, use the appropriate tool to generate the contract.
If the user asks to modify an existing smart contract, use these tools to determine the recommended patterns. Toggle the options in a tool to determine how different features affect the code, then apply the same types of changes to the user's contract.
`,
    },
  );

  registerSolidityTools(server);
  registerCairoTools(server);
  registerStellarTools(server);
  registerStylusTools(server);

  return server;
}
