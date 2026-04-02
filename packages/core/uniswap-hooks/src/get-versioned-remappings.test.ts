import test from 'ava';
import contractsVersion from '@openzeppelin/wizard/openzeppelin-contracts-version.json';
import { getVersionedRemappings } from './get-versioned-remappings';
import contractVersionPins from '../contract-version-pins';

test('getVersionedRemappings not upgradeable', t => {
  const remappings = getVersionedRemappings();
  t.is(remappings.length, 2);
  t.is(remappings[0], `@openzeppelin/contracts/=@openzeppelin/contracts@${contractsVersion.version}/`);
  t.is(
    remappings[1],
    `@openzeppelin/uniswap-hooks/=@openzeppelin/uniswap-hooks@${contractVersionPins.uniswapHooksVersion}/src/`,
  );
  t.false(remappings.some(remapping => remapping.includes('^')));
  t.snapshot(remappings);
});
