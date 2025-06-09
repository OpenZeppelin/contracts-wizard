import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityAccount } from '../account.js';
import { registerSolidityCustom } from '../custom.js';
import { registerSolidityERC20 } from '../erc20.js';
import { registerSolidityERC721 } from '../erc721.js';
import { registerSolidityERC1155 } from '../erc1155.js';
import { registerSolidityGovernor } from '../governor.js';
import { registerSolidityStablecoin } from '../stablecoin.js';
import { registerSolidityRWA } from '../rwa.js';

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