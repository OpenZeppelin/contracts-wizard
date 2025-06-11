export const stylusCommonDescriptions = {
    info: 'Metadata about the contract and author',
    license: 'The license used by the contract, default is "MIT"',
};

export const stylusERC20Descriptions = {
    permit: 'Whether without paying gas, token holders will be able to allow third parties to transfer from their account.',
    flashmint: 'Whether to include built-in flash loans to allow lending tokens without requiring collateral as long as they\'re returned in the same transaction.',
};

export const stylusERC721Descriptions = {
    enumerable: 'Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.',
};

export const stylusERC1155Descriptions = {
    supply: 'Whether to keep track of total supply of tokens',
};