import test from 'ava';
import { getVersionedRemappings } from './get-versioned-remappings';
import openzeppelinContracts from '../../solidity/openzeppelin-contracts';
import contractVersionPins from '../contract-version-pins';

test('getVersionedRemappings returns remappings for all confidential dependencies', t => {
  const remappings = getVersionedRemappings();
  t.is(remappings.length, 3);
  t.is(remappings[0], `@openzeppelin/contracts/=@openzeppelin/contracts@${openzeppelinContracts.version}/`);
  t.is(
    remappings[1],
    `@openzeppelin/confidential-contracts/=@openzeppelin/confidential-contracts@${contractVersionPins.confidentialContractsVersion}/`,
  );
  t.is(remappings[2], `@fhevm/solidity/=@fhevm/solidity@${contractVersionPins.fhevmSolidityVersion}/`);
  t.false(remappings.some(remapping => remapping.includes('^')));
  t.snapshot(remappings);
});
