import { printContract as printSolidityContract, type Contract } from '@openzeppelin/wizard';
import type { HooksOptions } from './hooks';
import { compatibleContractsSemver } from './utils/version';

export function printContract(contract: Contract, opts?: HooksOptions): string {
  return printSolidityContract(contract, {
    ...opts,
    additionalCompatibleLibraries: [
      { name: 'OpenZeppelin Uniswap Hooks', path: '@openzeppelin/uniswap-hooks', version: compatibleContractsSemver },
    ],
  });
}
