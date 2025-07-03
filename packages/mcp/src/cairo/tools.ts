import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoAccount } from './tools/account.js';
import { registerCairoCustom } from './tools/custom.js';
import { registerCairoERC20 } from './tools/erc20.js';
import { registerCairoERC721 } from './tools/erc721.js';
import { registerCairoERC1155 } from './tools/erc1155.js';
import { registerCairoGovernor } from './tools/governor.js';
import { registerCairoMultisig } from './tools/multisig.js';
import { registerCairoVesting } from './tools/vesting.js';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type CairoToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): CairoToolRegisterFunctions {
  return {
    ERC20: () => registerCairoERC20(server),
    ERC721: () => registerCairoERC721(server),
    ERC1155: () => registerCairoERC1155(server),
    Account: () => registerCairoAccount(server),
    Multisig: () => registerCairoMultisig(server),
    Governor: () => registerCairoGovernor(server),
    Vesting: () => registerCairoVesting(server),
    Custom: () => registerCairoCustom(server),
  };
}

export function registerCairoTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
