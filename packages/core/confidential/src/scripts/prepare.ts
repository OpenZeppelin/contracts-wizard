import { promises as fs } from 'fs';

import { version as confidentialContractsVersion } from '@openzeppelin/confidential-contracts/package.json';
import { version as fhevmSolidityVersion } from '@fhevm/solidity/package.json';

import type { ContractVersionPins } from '../../contract-version-pins';

async function main() {
  const contractVersionPins: ContractVersionPins = {
    fhevmSolidityVersion,
    confidentialContractsVersion,
  };

  await fs.writeFile('contract-version-pins.json', JSON.stringify(contractVersionPins, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
