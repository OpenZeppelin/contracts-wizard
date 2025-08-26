import type { Contract } from '../contract';

export function importsCommunityContracts(contract: Contract) {
  return contract.imports.some(i => i.path.startsWith('@openzeppelin/community-contracts/'));
}
