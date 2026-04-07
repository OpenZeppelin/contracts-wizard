import { promises as fs } from 'fs';

import { version as uniswapHooksVersion } from '@openzeppelin/uniswap-hooks/package.json';

import type { ContractVersionPins } from '../../contract-version-pins';

async function main() {
  const contractVersionPins: ContractVersionPins = {
    uniswapHooksVersion,
  };

  await fs.writeFile('contract-version-pins.json', JSON.stringify(contractVersionPins, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
