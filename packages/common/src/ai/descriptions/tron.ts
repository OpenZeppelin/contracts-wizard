// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

// TRON prompts. Used by MCP + CLI tron-* tools. Options are otherwise
// identical to the Solidity ecosystem; only the standard names + library
// import paths differ in the output (handled by `rewriteForTron`).
export const tronPrompts = {
  TRC20: 'Make a fungible token per the TRC-20 standard, targeting the TRON Virtual Machine.',
  TRC721: 'Make a non-fungible token per the TRC-721 standard, targeting the TRON Virtual Machine.',
  TRC1155: 'Make a multi-token contract per the TRC-1155 standard, targeting the TRON Virtual Machine.',
  Governor: 'Make a contract to implement governance, such as for a DAO, targeting the TRON Virtual Machine.',
  Custom: 'Make a custom smart contract, targeting the TRON Virtual Machine.',
};

// TRON-specific overrides of the Solidity Governor descriptions. Only the
// fields that differ from `solidityGovernorDescriptions` are listed here; the
// rest are reused. TRON's SR consensus produces a block every ~3s (vs ~12s on
// Ethereum), so the Governor's "block time" field defaults to 3 here.
export const tronGovernorDescriptions = {
  blockTime: 'The block time of the chain in seconds, default is 3.',
};
