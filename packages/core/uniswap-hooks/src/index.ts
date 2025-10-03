export { buildGeneric, type GenericOptions, type KindedOptions } from './build-generic';

export { sanitizeKind, type Kind } from './kind';

export { hooks } from './api';

export { HOOKS, specificSharesType } from './hooks/';

export type { Hook, HookName, HookCategory, Shares, Permissions, Permission, HookInput, SharesConfig } from './hooks/';

export { type HooksOptions } from './hooks';

export { compatibleContractsSemver } from './utils/version';

export { printContract } from './print';
