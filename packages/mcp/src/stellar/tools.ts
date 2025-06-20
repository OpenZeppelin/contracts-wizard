import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarFungible } from './tools/fungible.js';
import { registerStellarNonFungible } from './tools/non-fungible.js';
import type { KindedOptions } from '@openzeppelin/wizard-stellar';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type StellarToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): StellarToolRegisterFunctions {
  return {
    Fungible: () => registerStellarFungible(server),
    NonFungible: () => registerStellarNonFungible(server),
  };
}

export function registerStellarTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
