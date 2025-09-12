import openzeppelinContracts from '../../solidity/openzeppelin-contracts';
import contractVersionPins from '../contract-version-pins';
import type { Contract } from '@openzeppelin/wizard/src/contract';
import { printContract } from './print';

export function printContractVersioned(contract: Contract): string {
  return printContract(contract, {
    transformImport: p => {
      return {
        ...p,
        path: p.path
          .replace(/^@openzeppelin\/contracts(-upgradeable)?/, `$&@${openzeppelinContracts.version}`)
          .replace(/^@openzeppelin\/confidential-contracts/, `$&@${contractVersionPins.confidentialContractsVersion}`)
          .replace(/^@fhevm\/solidity/, `$&@${contractVersionPins.fhevmSolidityVersion}`),
      };
    },
  });
}
