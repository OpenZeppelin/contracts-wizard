import {
  solidityERC20AIFunctionDefinition,
  solidityERC721AIFunctionDefinition,
  solidityERC1155AIFunctionDefinition,
  solidityGovernorAIFunctionDefinition,
  solidityCustomAIFunctionDefinition,
} from './solidity.ts';

// The TRON AI assistant uses the same option shape as Solidity, less Account
// (ERC-4337 out of scope) and Stablecoin / RealWorldAsset (they depend on
// @openzeppelin/community-contracts, which is not ported to TRON). Function
// definitions are reused directly; the language identifier ('tron') is what
// differentiates assistant context.
export const tronERC20AIFunctionDefinition = solidityERC20AIFunctionDefinition;
export const tronERC721AIFunctionDefinition = solidityERC721AIFunctionDefinition;
export const tronERC1155AIFunctionDefinition = solidityERC1155AIFunctionDefinition;
export const tronGovernorAIFunctionDefinition = solidityGovernorAIFunctionDefinition;
export const tronCustomAIFunctionDefinition = solidityCustomAIFunctionDefinition;
