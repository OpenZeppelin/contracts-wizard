import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStylusERC20 } from './tools/erc20';
import { registerStylusERC721 } from './tools/erc721';
import { registerStylusERC1155 } from './tools/erc1155';
import type { KindedOptions } from '@openzeppelin/wizard-stylus';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type StylusToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): StylusToolRegisterFunctions {
  return {
    ERC20: () => registerStylusERC20(server),
    ERC721: () => registerStylusERC721(server),
    ERC1155: () => registerStylusERC1155(server),
  };
}

export function registerStylusTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
