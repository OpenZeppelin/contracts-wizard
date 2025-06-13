import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarFungible } from './tools/fungible.js';
import { registerStellarNonFungible } from './tools/non-fungible.js';

export function registerStellarTools(server: McpServer) {
  registerStellarFungible(server);
  registerStellarNonFungible(server);
}
