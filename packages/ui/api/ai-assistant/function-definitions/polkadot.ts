import { withoutChainlinkIntegrations } from './solidity-shared.ts';
import {
  solidityERC20AIFunctionDefinition,
  solidityERC721AIFunctionDefinition,
  solidityERC1155AIFunctionDefinition,
  solidityStablecoinAIFunctionDefinition,
  solidityRealWorldAssetAIFunctionDefinition,
  solidityGovernorAIFunctionDefinition,
  solidityCustomAIFunctionDefinition,
} from './solidity.ts';

export const polkadotERC20AIFunctionDefinition = withoutChainlinkIntegrations(
  solidityERC20AIFunctionDefinition,
  'Make a fungible token per the ERC-20 standard.',
);
export const polkadotERC721AIFunctionDefinition = solidityERC721AIFunctionDefinition;
export const polkadotERC1155AIFunctionDefinition = solidityERC1155AIFunctionDefinition;
export const polkadotStablecoinAIFunctionDefinition = withoutChainlinkIntegrations(
  solidityStablecoinAIFunctionDefinition,
  'Make a stablecoin token that uses the ERC-20 standard. Experimental, some features are not audited and are subject to change.',
);
export const polkadotRealWorldAssetAIFunctionDefinition = withoutChainlinkIntegrations(
  solidityRealWorldAssetAIFunctionDefinition,
  'Make a real-world asset token that uses the ERC-20 standard. Experimental, some features are not audited and are subject to change.',
);
export const polkadotGovernorAIFunctionDefinition = solidityGovernorAIFunctionDefinition;
export const polkadotCustomAIFunctionDefinition = solidityCustomAIFunctionDefinition;
