import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMidenFungible } from './tools/fungible';
import { registerMidenNonFungible } from './tools/non-fungible';
import type { KindedOptions } from '@openzeppelin/wizard-miden';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type MidenToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): MidenToolRegisterFunctions {
  return {
    Fungible: () => registerMidenFungible(server),
    NonFungible: () => registerMidenNonFungible(server),
  };
}

export function registerMidenTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
