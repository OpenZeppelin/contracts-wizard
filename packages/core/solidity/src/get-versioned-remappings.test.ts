import test from 'ava';
import { getVersionedRemappings } from './get-versioned-remappings';
import { getRawCompatibleContractsSemver } from './utils/version';

test('getVersionedRemappings not upgradeable', t => {
  const remappings = getVersionedRemappings({});
  t.is(remappings.length, 1);
  t.is(remappings[0], `@openzeppelin/contracts/=@openzeppelin/contracts@${getRawCompatibleContractsSemver()}/`);
  t.snapshot(remappings);
});

test('getVersionedRemappings upgradeable uups', t => {
  const remappings = getVersionedRemappings({ upgradeable: 'uups' });
  t.is(remappings.length, 2);
  t.is(remappings[0], `@openzeppelin/contracts/=@openzeppelin/contracts@${getRawCompatibleContractsSemver()}/`);
  t.is(
    remappings[1],
    `@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@${getRawCompatibleContractsSemver()}/`,
  );
  t.snapshot(remappings);
});

test('getVersionedRemappings upgradeable transparent', t => {
  const remappings = getVersionedRemappings({ upgradeable: 'transparent' });
  t.is(remappings.length, 2);
  t.is(remappings[0], `@openzeppelin/contracts/=@openzeppelin/contracts@${getRawCompatibleContractsSemver()}/`);
  t.is(
    remappings[1],
    `@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@${getRawCompatibleContractsSemver()}/`,
  );
  t.snapshot(remappings);
});
