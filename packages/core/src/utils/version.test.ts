import test from 'ava';

import semver from 'semver';

import { compatibleContractsSemver } from './version';
import contracts from '../../openzeppelin-contracts';

test('installed contracts satisfies compatible range', t => {
  t.true(semver.satisfies(contracts.version, compatibleContractsSemver),
    `Installed contracts version ${contracts.version} does not satisfy compatible range ${compatibleContractsSemver}.
Check whether the compatible range is up to date.`);
});
