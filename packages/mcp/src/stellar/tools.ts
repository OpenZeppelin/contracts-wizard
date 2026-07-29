import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarFungible } from './tools/fungible.js';
import { registerStellarGovernor } from './tools/governor.js';
import { registerStellarStablecoin } from './tools/stablecoin.js';
import { registerStellarNonFungible } from './tools/non-fungible.js';
import { registerStellarVault } from './tools/vault.js';
import type { KindedOptions } from '@openzeppelin/wizard-stellar';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type StellarToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): StellarToolRegisterFunctions {
  return {
    Fungible: () => registerStellarFungible(server),
    Governor: () => registerStellarGovernor(server),
    Stablecoin: () => registerStellarStablecoin(server),
    NonFungible: () => registerStellarNonFungible(server),
    Vault: () => registerStellarVault(server),
  };
}

export function registerStellarTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
