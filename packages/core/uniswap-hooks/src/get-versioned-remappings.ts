import openzeppelinContractsVersion from '@openzeppelin/wizard/openzeppelin-contracts-version.json';
import contractVersionPins from '../contract-version-pins';

export function getVersionedRemappings(): string[] {
  return [
    `@openzeppelin/contracts/=@openzeppelin/contracts@${openzeppelinContractsVersion.version}/`,
    `@openzeppelin/uniswap-hooks/=@openzeppelin/uniswap-hooks@${contractVersionPins.uniswapHooksVersion}/src/`,
  ];
}
