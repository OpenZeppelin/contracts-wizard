import test from 'ava';

import semver from 'semver';

import { compatibleConfidentialContractsSemver, compatibleFHEVMSolidityContractsSemver } from './version';
import contractVersionPins from '../../contract-version-pins';

const { fhevmSolidityVersion, confidentialContractsVersion } = contractVersionPins;

test('installed @fhevm/solidity satisfies compatible range', t => {
  t.true(
    semver.satisfies(fhevmSolidityVersion, compatibleFHEVMSolidityContractsSemver),
    `Installed @fhevm/solidity version ${fhevmSolidityVersion} does not satisfy compatible range ${compatibleFHEVMSolidityContractsSemver}.
Check whether the compatible range is up to date.`,
  );
});

test('installed @openzeppelin/confidential-contracts satisfies compatible range', t => {
  t.true(
    semver.satisfies(confidentialContractsVersion, compatibleConfidentialContractsSemver),
    `Installed @openzeppelin/confidential-contracts version ${confidentialContractsVersion} does not satisfy compatible range ${compatibleConfidentialContractsSemver}.
Check whether the compatible range is up to date.`,
  );
});
