import type { GenericOptions as SolidityOptions } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions } from '@openzeppelin/wizard-cairo';
import type { GenericOptions as StellarOptions } from '@openzeppelin/wizard-stellar';
import type { GenericOptions as StylusOptions } from '@openzeppelin/wizard-stylus';
import type { GenericOptions as ConfidentialOptions } from '@openzeppelin/wizard-confidential';

export type LanguagesOptions =
  | Required<SolidityOptions>
  | Required<CairoOptions>
  | Required<StellarOptions>
  | Required<StylusOptions>
  | Required<ConfidentialOptions>;

export type Language = 'solidity' | 'cairo' | 'stylus' | 'stellar' | 'confidential';
