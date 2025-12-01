import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerConfidentialERC7984 } from './tools/erc7984.js';
import type { KindedOptions } from '@openzeppelin/wizard-confidential';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type ConfidentialToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): ConfidentialToolRegisterFunctions {
  return {
    ERC7984: () => registerConfidentialERC7984(server),
  };
}

export function registerConfidentialTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
