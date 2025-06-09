import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStylusERC20 } from '../erc20';
import { registerStylusERC721 } from '../erc721';
import { registerStylusERC1155 } from '../erc1155';

export function registerStylusTools(server: McpServer) {
  registerStylusERC20(server);
  registerStylusERC721(server);
  registerStylusERC1155(server);
}
