import type { ERC20Options as CairoERC20Options } from '@openzeppelin/wizard-cairo/src/erc20';
import type { ERC721Options as CairoERC721Options } from '@openzeppelin/wizard-cairo/src/erc721';
import type { ERC1155Options as CairoERC1155Options } from '@openzeppelin/wizard-cairo/src/erc1155';
import type { AccountOptions as CairoAccountOptions } from '@openzeppelin/wizard-cairo/src/account';
import type { MultisigOptions as CairoMultisigOptions } from '@openzeppelin/wizard-cairo/src/multisig';
import type { GovernorOptions as CairoGovernorOptions } from '@openzeppelin/wizard-cairo/src/governor';
import type { VestingOptions as CairoVestingOptions } from '@openzeppelin/wizard-cairo/src/vesting';
import type { CustomOptions as CairoCustomOptions } from '@openzeppelin/wizard-cairo/src/custom';
import type { Access as CairoAccesss } from '@openzeppelin/wizard-cairo/src/set-access-control';
import type { Upgradeable as CairoUpgradeable } from '@openzeppelin/wizard-cairo/src/set-upgradeable';
import type { Info as CairoInfo } from '@openzeppelin/wizard-cairo/src/set-info';
import type { RoyaltyInfoOptions as CairoRoyaltyInfo } from '@openzeppelin/wizard-cairo/src/set-royalty-info';

export interface CairoCommonOptions {
  upgradeable?: CairoUpgradeable;
  info?: CairoInfo;
}

export type CairoCommonContractOptions = CairoCommonOptions & {
  access?: CairoAccesss;
};

export type CairoRoyaltyInfoOptions = {
  royaltyInfo?: CairoRoyaltyInfo;
};

export interface CairoKindedOptions {
  ERC20: { kind: 'ERC20' } & CairoCommonContractOptions & CairoERC20Options;
  ERC721: { kind: 'ERC721' } & CairoCommonContractOptions & CairoERC721Options & CairoRoyaltyInfoOptions;
  ERC1155: { kind: 'ERC1155' } & CairoCommonContractOptions &
    Omit<CairoERC1155Options, 'royaltyInfo'> &
    CairoRoyaltyInfoOptions;
  Account: { kind: 'Account' } & CairoCommonOptions & CairoAccountOptions;
  Multisig: { kind: 'Multisig' } & CairoCommonOptions & CairoMultisigOptions;
  Governor: { kind: 'Governor' } & CairoCommonOptions & CairoGovernorOptions;
  Vesting: { kind: 'Vesting' } & Omit<CairoVestingOptions, 'info'> & { info: CairoInfo };
  Custom: { kind: 'Custom' } & CairoCommonContractOptions & CairoCustomOptions;
}
