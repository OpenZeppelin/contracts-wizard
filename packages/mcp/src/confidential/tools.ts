import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerConfidentialConfidentialFungible } from './tools/confidentialFungible.js';
import type { KindedOptions } from '@openzeppelin/wizard-confidential';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type SolidityToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): SolidityToolRegisterFunctions {
  return {
    ConfidentialFungible: () => registerConfidentialConfidentialFungible(server),
  };
}

export function registerSolidityTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
