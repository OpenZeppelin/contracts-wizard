import test from 'ava';
import contracts from '@openzeppelin/wizard/openzeppelin-contracts';
import { getVersionedRemappings } from './get-versioned-remappings';
import { compatibleContractsSemver } from './utils/version';

test('getVersionedRemappings not upgradeable', t => {
  const remappings = getVersionedRemappings();
  t.is(remappings.length, 2);
  t.is(remappings[0], `@openzeppelin/contracts/=@openzeppelin/contracts@${contracts.version}/`);
  t.is(remappings[1], `@openzeppelin/uniswap-hooks/=@openzeppelin/uniswap-hooks@${compatibleContractsSemver}/src/`);
  t.snapshot(remappings);
});
