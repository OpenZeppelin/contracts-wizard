import type { GenericOptions as SolidityOptions } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions } from '@openzeppelin/wizard-cairo';
import type { GenericOptions as CairoAlphaOptions } from '@openzeppelin/wizard-cairo-alpha';
import type { GenericOptions as StellarOptions } from '@openzeppelin/wizard-stellar';
import type { GenericOptions as StylusOptions } from '@openzeppelin/wizard-stylus';

export type LanguagesOptions =
  | Required<SolidityOptions>
  | Required<CairoOptions>
  | Required<CairoAlphaOptions>
  | Required<StellarOptions>
  | Required<StylusOptions>;

export type Language = 'solidity' | 'cairo' | 'cairo-alpha' | 'polkadot-solidity' | 'stylus' | 'stellar';
