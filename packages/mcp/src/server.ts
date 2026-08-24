import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityTools } from './solidity/tools.js';
import { registerCairoTools } from './cairo/tools.js';
import { registerConfidentialTools } from './confidential/tools.js';
import { registerStellarTools } from './stellar/tools.js';
import { registerStylusTools } from './stylus/tools.js';
import { registerTronTools } from './tron/tools.js';
import { registerUniswapHooksTools } from './uniswap-hooks/tools.js';
import { version } from '../package.json';

export function createServer() {
  const server = new McpServer(
    {
      name: 'OpenZeppelin Contracts Wizard',
      version,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
      instructions: `\
Tools are provided for different smart contract languages and blockchain ecosystems.
Each tool generates a smart contract using recommended best practices with OpenZeppelin Contracts libraries, and returns the source code. The tools do not write to disk.
If the user requests to create a new smart contract, use the appropriate tool to generate the contract.
If the user asks to modify an existing smart contract, use these tools to determine the recommended patterns. Toggle the options in a tool to determine how different features affect the code, then apply the same types of changes to the user's contract.
Hosts that support MCP Apps may also show an interactive Wizard UI for each tool (same options and live code preview). Non-Apps clients still receive the source as Markdown text.
`,
    },
  );

  registerSolidityTools(server);
  registerCairoTools(server);
  registerConfidentialTools(server);
  registerStellarTools(server);
  registerStylusTools(server);
  registerTronTools(server);
  registerUniswapHooksTools(server);

  return server;
}
