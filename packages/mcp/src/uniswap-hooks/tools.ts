import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerUniswapHooks } from './tools/hooks.js';

export function registerUniswapHooksTools(server: McpServer) {
  registerUniswapHooks(server);
}
