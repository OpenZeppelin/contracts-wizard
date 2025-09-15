import { printContract as printSolidityContract } from '@openzeppelin/wizard';
import type { Options } from '@openzeppelin/wizard';
import { compatibleConfidentialContractsSemver } from './utils/version';
import type { Contract } from '@openzeppelin/wizard';

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
