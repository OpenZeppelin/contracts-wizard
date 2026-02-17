import test from 'ava';

import { ContractBuilder } from '@openzeppelin/wizard';
import { printContractVersioned } from './print-versioned';

const toParentContract = (name: string, path: string) => {
  return {
    name: name,
    path: path,
  };
};

test('contract with versioned imports', t => {
  const TestContract = new ContractBuilder('TestContract');

  // Add imports that should match replacement patterns
  TestContract.addParent(toParentContract('ConfidentialContract', '@openzeppelin/confidential-contracts/Foo1.sol'));
  TestContract.addParent(toParentContract('FhevmContract', '@fhevm/solidity/Foo2.sol'));
  TestContract.addParent(toParentContract('StandardContract', '@openzeppelin/contracts/Foo3.sol'));
  TestContract.addParent(toParentContract('UpgradeableContract', '@openzeppelin/contracts-upgradeable/Foo4.sol'));

  // Add imports that should NOT match replacement patterns
  TestContract.addParent(toParentContract('CustomContract', './FooCustom.sol'));
  TestContract.addParent(toParentContract('ThirdPartyLib', '@third-party/library/FooThirdParty.sol'));
  TestContract.addParent(toParentContract('LocalImport', '../utils/FooLocal.sol'));

  // Add import-only references to test those as well
  TestContract.addImportOnly({
    name: 'FhevmType',
    path: '@fhevm/solidity/Types.sol',
  });
  TestContract.addImportOnly({
    name: 'IFoo',
    path: '@openzeppelin/contracts/IFoo.sol',
  });
  TestContract.addImportOnly({
    name: 'FooUpgradeable',
    path: '@openzeppelin/contracts-upgradeable/FooUpgradeable.sol',
  });
  TestContract.addImportOnly({
    name: 'FooUnrelated',
    path: '@unrelated/package/FooUnrelated.sol',
  });

  const result = printContractVersioned(TestContract);

  // Verify that versioned imports are added correctly
  t.true(result.includes('@openzeppelin/confidential-contracts@'));
  t.true(result.includes('@fhevm/solidity@'));
  t.true(result.includes('@openzeppelin/contracts@'));
  t.true(result.includes('@openzeppelin/contracts-upgradeable@'));

  // Verify that non-matching imports are not modified
  t.true(result.includes('./FooCustom.sol'));
  t.true(result.includes('@third-party/library/FooThirdParty.sol'));
  t.true(result.includes('../utils/FooLocal.sol'));
  t.true(result.includes('@unrelated/package/FooUnrelated.sol'));

  // Verify the contract is properly generated
  t.true(result.includes('contract TestContract'));

  t.snapshot(result);
});

test('contract with basic structure', t => {
  const BasicContract = new ContractBuilder('BasicContract');

  // Add a simple parent with versioned import
  BasicContract.addParent(toParentContract('ConfidentialContract', '@openzeppelin/confidential-contracts/Foo1.sol'));

  const result = printContractVersioned(BasicContract);

  // Verify basic structure and versioning
  t.true(result.includes('contract BasicContract'));
  t.true(result.includes('@openzeppelin/confidential-contracts@'));

  t.snapshot(result);
});
