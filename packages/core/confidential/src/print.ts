import { printContract as printSolidityContract } from '@openzeppelin/wizard/src/print';
import type { Options } from '@openzeppelin/wizard/src/options';
import { compatibleConfidentialContractsSemver } from './utils/version';
import type { Contract } from '@openzeppelin/wizard/src/contract';

export function printContract(contract: Contract, opts?: Options): string {
  return printSolidityContract(contract, {
    ...opts,
    additionalCompatibleLibraries: [
      {
        name: 'OpenZeppelin Confidential Contracts',
        path: '@openzeppelin/confidential-contracts',
        version: compatibleConfidentialContractsSemver,
      },
    ],
  });
}
