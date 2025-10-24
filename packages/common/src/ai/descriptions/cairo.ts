// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const cairoPrompts = {
  ERC20: 'Make a fungible token per the ERC-20 standard.',
  ERC721: 'Make a non-fungible token per the ERC-721 standard.',
  ERC1155: 'Make a non-fungible token per the ERC-1155 standard.',
  Governor: 'Make a contract to implement governance, such as for a DAO.',
  Multisig:
    'Make a multi-signature smart contract, requiring a quorum of registered signers to approve and collectively execute transactions.',
  Vesting:
    'Make a vesting smart contract that manages the gradual release of ERC-20 tokens to a designated beneficiary based on a predefined vesting schedule.',
  Account:
    'Make a custom smart contract that represents an account that can be deployed and interacted with other contracts, and can be extended to implement custom logic. An account is a special type of contract that is used to validate and execute transactions.',
  Custom: 'Make a custom smart contract.',
};

export const cairoCommonDescriptions = {
  access:
    'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.',
  upgradeable: 'Whether the smart contract is upgradeable.',
  appName:
    'Required when votes is enabled, for hashing and signing typed structured data. Name for domain separator implementing SNIP12Metadata trait. Prevents two applications from producing the same hash.',
  appVersion:
    'Required when votes is enabled, for hashing and signing typed structured data. Version for domain separator implementing SNIP12Metadata trait. Prevents two versions of the same application from producing the same hash.',
  royaltyInfo:
    'Provides information for how much royalty is owed and to whom, based on a sale price. Follows ERC-2981 standard.',
};

export const cairoAlphaAccessDescriptions = {
  accessType:
    'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts. Roles (Default Admin Rules) provides additional enforced security measures on top of standard Roles mechanism for managing the most privileged role: default admin.',
  darInitialDelay: 'The initial delay for the default admin role (in case Roles (Default Admin Rules) is used).',
  darDefaultDelayIncrease:
    'The default delay increase for the default admin role (in case Roles (Default Admin Rules) is used).',
};

export const cairoRoyaltyInfoDescriptions = {
  enabled: 'Whether to enable royalty feature for the contract',
  defaultRoyaltyFraction:
    "The royalty fraction that will be default for all tokens. It will be used for a token if there's no custom royalty fraction set for it.",
  feeDenominator: "The denominator used to interpret a token's fee and to calculate the result fee fraction.",
};

export const cairoERC20Descriptions = {
  premint: 'The number of tokens to premint for the deployer.',
  decimals: 'The number of decimals to use for the contract. Defaults to 18.',
  votes:
    "Whether to keep track of historical balances for voting in on-chain governance, with a way to delegate one's voting power to a trusted account.",
};

export const cairoERC721Descriptions = {
  baseUri: 'A base uri for the non-fungible token.',
  enumerable:
    'Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.',
  votes:
    'Whether to keep track of individual units for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps.',
};

export const cairoERC1155Descriptions = {
  baseUri:
    'The location of the metadata for the token. Clients will replace any instance of {id} in this string with the tokenId.',
  updatableUri: 'Whether privileged accounts will be able to set a new URI for all token types.',
};

export const cairoGovernorDescriptions = {
  delay:
    'The delay since proposal is created until voting starts, in readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/, default is "1 day".',
  period:
    'The length of period during which people can cast their vote, in readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/, default is "1 week".',
  proposalThreshold: 'Minimum number of votes an account must have to create a proposal, default is 0.',
  decimals:
    'The number of decimals to use for the contract, default is 18 for ERC20Votes and 0 for ERC721Votes (because it does not apply to ERC721Votes).',
  quorumMode: 'The type of quorum mode to use, either by percentage or absolute value.',
  quorumPercent: 'The percent required, in cases of quorumMode equals percent.',
  quorumAbsolute: 'The absolute quorum required, in cases of quorumMode equals absolute.',
  votes:
    'The type of voting to use. Either erc20votes, meaning voting power with a votes-enabled ERC20 token. Either erc721votes, meaning voting power with a votes-enabled ERC721 token. Voters can entrust their voting power to a delegate.',
  clockMode:
    'The clock mode used by the voting token. For now, only timestamp mode where the token uses voting durations expressed as timestamps is supported. For Governor, this must be chosen to match what the ERC20 or ERC721 voting token uses.',
  timelock:
    'Whether to add a delay to actions taken by the Governor. Gives users time to exit the system if they disagree with governance decisions. If "openzeppelin", Module compatible with OpenZeppelin\'s TimelockController.',
  settings: 'Whether to allow governance to update voting settings (delay, period, proposal threshold).',
};

export const cairoVestingDescriptions = {
  startDate: 'The timestamp marking the beginning of the vesting period. In HTML input datetime-local format',
  duration:
    'The total duration of the vesting period. In readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/',
  cliffDuration:
    'The duration of the cliff period. Must be less than or equal to the total duration. In readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/',
  schedule:
    'A vesting schedule implementation, tokens can either be vested gradually following a linear curve or with custom vesting schedule that requires the implementation of the VestingSchedule trait.',
};

export const cairoAccountDescriptions = {
  type: 'Type of signature used for signature checking by the Account contract, Starknet account uses the STARK curve, Ethereum-flavored account uses the Secp256k1 curve.',
  declare: 'Whether to enable the account to declare other contract classes.',
  deploy: 'Whether to enables the account to be counterfactually deployed.',
  pubkey: 'Whether to enables the account to change its own public key.',
  outsideExecution:
    'Whether to allow a protocol to submit transactions on behalf of the account, as long as it has the relevant signatures.',
};

export const cairoMultisigDescriptions = {
  quorum: 'The minimal number of confirmations required by the Multisig to approve a transaction.',
};
