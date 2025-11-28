// ===== Public API =====

export { erc20, erc721, erc1155, stablecoin, realWorldAsset, account, governor, custom } from './api';
export type { WizardContractAPI, AccessControlAPI } from './api';

export type { ERC20Options } from './erc20';
export type { ERC721Options } from './erc721';
export type { ERC1155Options } from './erc1155';
export type { StablecoinOptions } from './stablecoin';
export type { AccountOptions } from './account';
export type { GovernorOptions } from './governor';
export type { CustomOptions } from './custom';

// ===== Internal API - Intended for use by other Wizard packages only =====

export type { GenericOptions, KindedOptions } from './build-generic';
export { buildGeneric } from './build-generic';

export { generateAlternatives } from './generate/alternatives';

export type { Contract, BaseFunction, Value, ReferencedContract, FunctionArgument } from './contract';
export { ContractBuilder } from './contract';

export { printContract } from './print';

export type { Access } from './set-access-control';
export { accessOptions, setAccessControl, requireAccessControl } from './set-access-control';
export { addPausable } from './add-pausable';
export type { Upgradeable } from './set-upgradeable';
export type { Info } from './set-info';

export { premintPattern, chainIdPattern } from './erc20';
export { defaults as infoDefaults, setInfo, infoOptions } from './set-info';
export { supportsInterface } from './common-functions';

export type { OptionsErrorMessages } from './error';
export { OptionsError } from './error';

export type { Kind } from './kind';
export { sanitizeKind } from './kind';

export { compatibleContractsSemver } from './utils/version';

export { defineFunctions } from './utils/define-functions';
export type { CommonOptions } from './common-options';
export { withCommonDefaults, defaults as commonDefaults } from './common-options';
export type { ClockMode } from './set-clock-mode';
export { clockModeDefault, setClockMode, clockModeOptions } from './set-clock-mode';
export { toBigInt } from './utils/convert-strings';
export type { Options } from './options';
export type { Lines } from './utils/format-lines';
export { formatLinesWithSpaces, spaceBetween } from './utils/format-lines';
export { findCover } from './utils/find-cover';
export { HardhatZipGenerator } from './zip-hardhat';
export type { PremintCalculation } from './erc20';
export { calculatePremint as calculateERC20Premint, scaleByPowerOfTen } from './erc20';
