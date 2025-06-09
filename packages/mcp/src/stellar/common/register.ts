import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarFungible } from '../fungible.js';
import { registerStellarNonFungible } from '../non-fungible.js';

export function registerStellarTools(server: McpServer) {
  registerStellarFungible(server);
  registerStellarNonFungible(server);
}
