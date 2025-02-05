import contracts from '../openzeppelin-contracts';
import type { Contract } from "./contract";
import { printContract } from "./print";

export function printContractVersioned(contract: Contract): string {
  return printContract(contract, {
    transformImport: p => {
      return {
        ...p,
        path: p.path.replace(/^@openzeppelin\/contracts(-upgradeable)?/, `$&@${contracts.version}`),
      }
    }
  });
}


