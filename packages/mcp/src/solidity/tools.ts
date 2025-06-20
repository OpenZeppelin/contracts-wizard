import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityAccount } from './tools/account.js';
import { registerSolidityCustom } from './tools/custom.js';
import { registerSolidityERC20 } from './tools/erc20.js';
import { registerSolidityERC721 } from './tools/erc721.js';
import { registerSolidityERC1155 } from './tools/erc1155.js';
import { registerSolidityGovernor } from './tools/governor.js';
import { registerSolidityStablecoin } from './tools/stablecoin.js';
import { registerSolidityRWA } from './tools/rwa.js';
import type { KindedOptions } from '@openzeppelin/wizard';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type SolidityToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): SolidityToolRegisterFunctions {
  return {
    ERC20: () => registerSolidityERC20(server),
    ERC721: () => registerSolidityERC721(server),
    ERC1155: () => registerSolidityERC1155(server),
    Stablecoin: () => registerSolidityStablecoin(server),
    RealWorldAsset: () => registerSolidityRWA(server),
    Account: () => registerSolidityAccount(server),
    Governor: () => registerSolidityGovernor(server),
    Custom: () => registerSolidityCustom(server),
  };
}

export function registerSolidityTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
