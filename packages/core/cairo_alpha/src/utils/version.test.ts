import test from 'ava';

import semver from 'semver';

import { contractsVersion, compatibleContractsSemver } from './version';

test('latest target contracts satisfies compatible range', t => {
  t.true(
    semver.satisfies(contractsVersion, compatibleContractsSemver),
    `Latest target contracts version ${contractsVersion} does not satisfy compatible range ${compatibleContractsSemver}.
Check whether the compatible range is up to date.`,
  );
});
