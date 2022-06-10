import type { Contract } from './contract';

export interface Helpers {
  upgradeable: boolean;
}

export function withHelpers(contract: Contract): Helpers {
  const upgradeable = contract.upgradeable;
  return {
    upgradeable
  };
}
