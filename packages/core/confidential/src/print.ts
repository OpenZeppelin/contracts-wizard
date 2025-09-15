import { printContract as printSolidityContract, type Options, type Contract } from '@openzeppelin/wizard';
import { compatibleConfidentialContractsSemver } from './utils/version';

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
