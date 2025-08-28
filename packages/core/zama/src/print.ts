import { printContract as printSolidityContract } from '@openzeppelin/wizard/src/print';
import type { ConfidentialFungibleOptions } from './confidentialFungible';
import { compatibleContractsSemver } from './utils/version';
import type { Contract } from '@openzeppelin/wizard/src/contract';

export function printContract(contract: Contract, opts?: ConfidentialFungibleOptions): string {
  return printSolidityContract(contract, {
    ...opts,
    additionalCompatibleLibraries: [
      {
        name: 'OpenZeppelin Confidential Contracts',
        path: '@openzeppelin/confidential-contracts',
        version: compatibleContractsSemver,
      },
    ],
  });
}
