import type { FungibleOptions as StellarFungibleOptions } from '@openzeppelin/wizard-stellar/src/fungible';
import type { Access as StellarAccess } from '@openzeppelin/wizard-stellar/src/set-access-control';
import type { Info as StellarInfo } from '@openzeppelin/wizard-stellar/src/set-info';

export type StellarCommonOptions = {
  info?: StellarInfo;
};

export type StellarCommonContractOptions = {
  access?: StellarAccess;
};

export interface StellarKindedOptions {
  Fungible: { kind: 'Fungible' } & StellarCommonOptions & StellarCommonContractOptions & StellarFungibleOptions;
}
