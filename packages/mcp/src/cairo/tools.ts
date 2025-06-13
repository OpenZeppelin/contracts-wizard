import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoAccount } from './tools/account.js';
import { registerCairoCustom } from './tools/custom.js';
import { registerCairoERC20 } from './tools/erc20.js';
import { registerCairoERC721 } from './tools/erc721.js';
import { registerCairoERC1155 } from './tools/erc1155.js';
import { registerCairoGovernor } from './tools/governor.js';
import { registerCairoMultisig } from './tools/multisig.js';
import { registerCairoVesting } from './tools/vesting.js';

export function registerCairoTools(server: McpServer) {
  registerCairoAccount(server);
  registerCairoERC20(server);
  registerCairoERC721(server);
  registerCairoERC1155(server);
  registerCairoGovernor(server);
  registerCairoMultisig(server);
  registerCairoVesting(server);
  registerCairoCustom(server);
}
