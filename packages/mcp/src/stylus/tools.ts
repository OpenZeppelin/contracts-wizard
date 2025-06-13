import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStylusERC20 } from './tools/erc20';
import { registerStylusERC721 } from './tools/erc721';
import { registerStylusERC1155 } from './tools/erc1155';

export function registerStylusTools(server: McpServer) {
  registerStylusERC20(server);
  registerStylusERC721(server);
  registerStylusERC1155(server);
}
