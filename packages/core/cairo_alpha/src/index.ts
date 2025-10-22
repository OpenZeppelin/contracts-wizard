export type { GenericOptions, KindedOptions } from './build-generic';
export { buildGeneric } from './build-generic';

export type { Contract } from './contract';
export { ContractBuilder } from './contract';

export { printContract } from './print';

export type { Access } from './set-access-control';
export type { Account } from './account';
export type { Upgradeable } from './set-upgradeable';
export type { Info } from './set-info';
export type { RoyaltyInfoOptions } from './set-royalty-info';
export type { MacrosOptions } from './set-macros';

export { premintPattern } from './erc20';

export { defaults as infoDefaults } from './set-info';
export { defaults as royaltyInfoDefaults } from './set-royalty-info';
export { defaults as macrosDefaults } from './set-macros';

export type { OptionsErrorMessages } from './error';
export { OptionsError } from './error';

export type { Kind } from './kind';
export { sanitizeKind } from './kind';

export { contractsVersion, contractsVersionTag, compatibleContractsSemver } from './utils/version';

export { erc20, erc721, erc1155, account, multisig, governor, vesting, custom } from './api';

export type { ERC20Options } from './erc20';
export type { ERC721Options } from './erc721';
export type { ERC1155Options } from './erc1155';
export type { AccountOptions } from './account';
export type { MultisigOptions } from './multisig';
export type { GovernorOptions } from './governor';
export type { VestingOptions } from './vesting';
export type { CustomOptions } from './custom';
