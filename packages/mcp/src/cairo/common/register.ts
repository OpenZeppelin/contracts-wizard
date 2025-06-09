import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoAccount } from '../account.js';
import { registerCairoCustom } from '../custom.js';
import { registerCairoERC20 } from '../erc20.js';
import { registerCairoERC721 } from '../erc721.js';
import { registerCairoERC1155 } from '../erc1155.js';
import { registerCairoGovernor } from '../governor.js';
import { registerCairoMultisig } from '../multisig.js';
import { registerCairoVesting } from '../vesting.js';

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
