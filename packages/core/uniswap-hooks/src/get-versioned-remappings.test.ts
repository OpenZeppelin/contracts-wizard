import test from 'ava';
import contracts from '@openzeppelin/wizard/openzeppelin-contracts';
import { getVersionedRemappings } from './get-versioned-remappings';
import { compatibleContractsSemver } from './utils/version';

test('getVersionedRemappings not upgradeable', t => {
  const remappings = getVersionedRemappings({});
  t.is(remappings.length, 2);
  t.is(remappings[0], `@openzeppelin/contracts/=@openzeppelin/contracts@${contracts.version}/`);
  t.is(remappings[1], `@openzeppelin/uniswap-hooks/=@openzeppelin/uniswap-hooks@${compatibleContractsSemver}/`);
  t.snapshot(remappings);
});

test('getVersionedRemappings upgradeable uups', t => {
  const remappings = getVersionedRemappings({ upgradeable: 'uups' });
  t.is(remappings.length, 3);
  t.is(remappings[0], `@openzeppelin/contracts/=@openzeppelin/contracts@${contracts.version}/`);
  t.is(remappings[1], `@openzeppelin/uniswap-hooks/=@openzeppelin/uniswap-hooks@${compatibleContractsSemver}/`);
  t.is(remappings[2], `@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@${contracts.version}/`);
  t.snapshot(remappings);
});

test('getVersionedRemappings upgradeable transparent', t => {
  const remappings = getVersionedRemappings({ upgradeable: 'transparent' });
  t.is(remappings.length, 3);
  t.is(remappings[0], `@openzeppelin/contracts/=@openzeppelin/contracts@${contracts.version}/`);
  t.is(remappings[1], `@openzeppelin/uniswap-hooks/=@openzeppelin/uniswap-hooks@${compatibleContractsSemver}/`);
  t.is(remappings[2], `@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@${contracts.version}/`);
  t.snapshot(remappings);
});
