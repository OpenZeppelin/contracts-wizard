import type {
  ERC20Options as SolidityERC20OptionsBase,
  CrossChainBridging as SolidityCrossChainBridging,
} from '@openzeppelin/wizard/src/erc20';
import type { ERC721Options as SolidityERC721OptionsBase } from '@openzeppelin/wizard/src/erc721';
import type { ERC1155Options as SolidityERC1155OptionsBase } from '@openzeppelin/wizard/src/erc1155';
import type { StablecoinOptions as SolidityStablecoinOptionsBase } from '@openzeppelin/wizard/src/stablecoin';
import type { GovernorOptions as SolidityGovernorOptionsBase } from '@openzeppelin/wizard/src/governor';
import type { CustomOptions as SolidityCustomOptionsBase } from '@openzeppelin/wizard/src/custom';
import type { Access as SolidityAccess } from '@openzeppelin/wizard/src/set-access-control';
import type { Upgradeable as SolidityUpgradeable } from '@openzeppelin/wizard/src/set-upgradeable';
import type { Info as SolidityInfo } from '@openzeppelin/wizard/src/set-info';
import type { ClockMode as SolidityClockMode } from '@openzeppelin/wizard/src/set-clock-mode';

export interface SolidityCommonOptions {
  access?: SolidityAccess;
  upgradeable?: SolidityUpgradeable;
  info?: SolidityInfo;
}

type SolidityRetypedOptions = {
  votes?: false | SolidityClockMode;
  crossChainBridging?: SolidityCrossChainBridging;
  clockMode?: SolidityClockMode;
};

type WithSolidityRetypedOption<T, TKeys extends keyof SolidityRetypedOptions> = SolidityCommonOptions &
  Omit<T, TKeys> &
  Pick<SolidityRetypedOptions, TKeys>;

type SolidityERC20Options = WithSolidityRetypedOption<SolidityERC20OptionsBase, 'votes' | 'crossChainBridging'>;

type SolidityERC721Options = WithSolidityRetypedOption<SolidityERC721OptionsBase, 'votes'>;

type SolidityERC1155Options = SolidityCommonOptions & SolidityERC1155OptionsBase;

type SolidityStablecoinOptions = WithSolidityRetypedOption<
  Omit<SolidityERC20Options, 'upgradeable'> & { upgradeable?: false },
  'votes' | 'crossChainBridging'
> &
  SolidityStablecoinOptionsBase;

type RealWorldAssetOptions = SolidityStablecoinOptions;

type SolidityGovernorOptions = WithSolidityRetypedOption<SolidityGovernorOptionsBase, 'clockMode'>;

type SolidityCustomOptions = SolidityCommonOptions & SolidityCustomOptionsBase;

export interface SolidityKindedOptions {
  ERC20: { kind: 'ERC20' } & SolidityERC20Options;
  ERC721: { kind: 'ERC721' } & SolidityERC721Options;
  ERC1155: { kind: 'ERC1155' } & SolidityERC1155Options;
  Stablecoin: { kind: 'Stablecoin' } & SolidityStablecoinOptions;
  RealWorldAsset: { kind: 'RealWorldAsset' } & RealWorldAssetOptions;
  Governor: { kind: 'Governor' } & SolidityGovernorOptions;
  Custom: { kind: 'Custom' } & SolidityCustomOptions;
}
