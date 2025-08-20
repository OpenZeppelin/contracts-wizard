import { printContract as printSolidityContract } from '@openzeppelin/wizard/';
import type { HooksOptions } from './hooks';
import { compatibleContractsSemver } from './utils/version';
import type { Contract } from '@openzeppelin/wizard/src/contract';

export function printContract(contract: Contract, opts?: HooksOptions): string {
  return printSolidityContract(contract, {
    ...opts,
    additionalCompatibleLibraries: [
      { name: 'OpenZeppelin Uniswap Hooks', path: '@openzeppelin/uniswap-hooks', version: compatibleContractsSemver },
      // { name: 'UniswapV4 Core', path: '@uniswap/v4-core', version: '^1.0.0' },
    ],
  });
}
