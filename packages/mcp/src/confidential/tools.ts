import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerConfidentialConfidentialFungible } from './tools/confidentialFungible.js';
import type { KindedOptions } from '@openzeppelin/wizard-confidential';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type ConfidentialToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): ConfidentialToolRegisterFunctions {
  return {
    ConfidentialFungible: () => registerConfidentialConfidentialFungible(server),
  };
}

export function registerConfidentialTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
