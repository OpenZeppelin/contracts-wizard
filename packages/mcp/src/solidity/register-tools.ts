import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityAccount } from './tools/account.js';
import { registerSolidityCustom } from './tools/custom.js';
import { registerSolidityERC20 } from './tools/erc20.js';
import { registerSolidityERC721 } from './tools/erc721.js';
import { registerSolidityERC1155 } from './tools/erc1155.js';
import { registerSolidityGovernor } from './tools/governor.js';
import { registerSolidityStablecoin } from './tools/stablecoin.js';
import { registerSolidityRWA } from './tools/rwa.js';

export function registerSolidityTools(server: McpServer) {
  registerSolidityERC20(server);
  registerSolidityERC721(server);
  registerSolidityERC1155(server);
  registerSolidityStablecoin(server);
  registerSolidityAccount(server);
  registerSolidityGovernor(server);
  registerSolidityCustom(server);
  registerSolidityRWA(server);
}