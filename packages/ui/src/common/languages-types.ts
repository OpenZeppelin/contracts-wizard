import type { GenericOptions as SolidityOptions, Contract as SolidityContract } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions, Contract as CairoContract } from '@openzeppelin/wizard-cairo';
import type { GenericOptions as StellarOptions, Contract as StellarContract } from '@openzeppelin/wizard-stellar';
import type { GenericOptions as StylusOptions, Contract as StylusContract } from '@openzeppelin/wizard-stylus';

export type LanguagesOptions =
  | Required<SolidityOptions>
  | Required<CairoOptions>
  | Required<StellarOptions>
  | Required<StylusOptions>;

export type LanguagesContract = SolidityContract | CairoContract | StellarContract | StylusContract;

export type Language = 'solidity' | 'cairo' | 'stylus' | 'stellar';
