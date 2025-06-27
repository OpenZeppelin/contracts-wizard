import test from 'ava';

import {
  addDependenciesWith,
  contractOptionsToContractName,
  getAddressArgs,
  printContractCargo,
  printRustNameTest,
} from './zip-shared';

test('contractOptionsToContractName converts PascalCase to snake_case', t => {
  t.is(contractOptionsToContractName('Fungible'), 'fungible');
  t.is(contractOptionsToContractName('NonFungible'), 'non_fungible');
  t.is(contractOptionsToContractName('Pausable'), 'pausable');
  t.is(contractOptionsToContractName('Upgradeable'), 'upgradeable');
  t.is(contractOptionsToContractName('MyCustomKind'), 'my_custom_kind');
});

test('contractOptionsToContractName handles single uppercase letter', t => {
  t.is(contractOptionsToContractName('A'), 'a');
});

test('contractOptionsToContractName handles empty string', t => {
  t.is(contractOptionsToContractName(''), '');
});

test('contractOptionsToContractName handles already snake_case', t => {
  t.is(contractOptionsToContractName('already_snake_case'), 'already_snake_case');
});

test('getAddressArgs returns names of address type constructor arguments', t => {
  const contract = {
    constructorArgs: [
      { name: 'owner', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'recipient', type: 'ADDRESS' },
      { name: 'flag', type: 'bool' },
      { name: 'admin', type: 'Address' },
    ],
  };
  t.deepEqual(getAddressArgs(contract), ['admin']);
});

test('getAddressArgs returns empty array if no address args', t => {
  const contract = {
    constructorArgs: [
      { name: 'amount', type: 'uint256' },
      { name: 'flag', type: 'bool' },
    ],
  };
  t.deepEqual(getAddressArgs(contract), []);
});

test('getAddressArgs handles missing or undefined types', t => {
  const contract = {
    constructorArgs: [
      { name: 'foo' },
      { name: 'bar', type: undefined },
      { name: 'baz', type: null },
      { name: 'admin', type: 'Address' },
    ],
  };

  //@ts-expect-error testing for invalid arguments
  t.deepEqual(getAddressArgs(contract), ['admin']);
});

test('getAddressArgs ignores case and trims whitespace', t => {
  const contract = {
    constructorArgs: [
      { name: 'foo', type: ' Address ' },
      { name: 'bar', type: ' address' },
      { name: 'baz', type: 'ADDRESS ' },
    ],
  };
  t.deepEqual(getAddressArgs(contract), ['foo']);
});

test('getAddressArgs returns empty array when constructorArgs is empty', t => {
  const contract = { constructorArgs: [] };
  t.deepEqual(getAddressArgs(contract), []);
});

test('getAddressArgs returns empty array when constructorArgs is missing', t => {
  //@ts-expect-error testing missing property
  t.deepEqual(getAddressArgs({}), []);
});

test('addDependenciesWith adds dependencies with correct value', t => {
  const result = addDependenciesWith('^1.0.0', ['base', 'fungible']);
  t.true(result.includes('stellar-default-impl-macro = ^1.0.0'));
  t.true(result.includes('stellar-fungible = ^1.0.0'));
});

test('addDependenciesWith handles empty dependenciesToAdd', t => {
  const result = addDependenciesWith('^1.0.0', []);
  t.is(result, '');
});

test('addDependenciesWith works with all dependency types', t => {
  const result = addDependenciesWith('^1.0.0', [
    'base',
    'fungible',
    'nonFungible',
    'pausable',
    'upgradable',
    'soroban',
  ]);
  t.true(result.includes('stellar-default-impl-macro = ^1.0.0'));
  t.true(result.includes('stellar-fungible = ^1.0.0'));
  t.true(result.includes('stellar-non-fungible = ^1.0.0'));
  t.true(result.includes('stellar-pausable = ^1.0.0'));
  t.true(result.includes('stellar-pausable-macros = ^1.0.0'));
  t.true(result.includes('stellar-upgradeable = ^1.0.0'));
  t.true(result.includes('stellar-upgradeable-macros = ^1.0.0'));
  t.true(result.includes('soroban-sdk = ^1.0.0'));
});

test('printRustNameTest generates test code with address args', t => {
  const contract = {
    name: 'Fungible',
    constructorArgs: [
      { name: 'owner', type: 'Address' },
      { name: 'admin', type: 'Address' },
    ],
  };
  const output = printRustNameTest(contract);

  const expected = `#![cfg(test)]

extern crate std;

use soroban_sdk::{ testutils::Address as _, Address, Env, String };

use crate::contract::{ Fungible, FungibleClient };

#[test]
fn initial_state() {
    let env = Env::default();

    let contract_addr = env.register(Fungible, (Address::generate(&env),Address::generate(&env)));
    let client = FungibleClient::new(&env, &contract_addr);

    assert_eq!(client.name(), String::from_str(&env, "Fungible"));
}

// Add more tests bellow
`;
  t.is(output, expected);
});

test('printRustNameTest generates test code without address args', t => {
  const contract = {
    name: 'NoArgs',
    constructorArgs: [],
  };
  const output = printRustNameTest(contract);

  const expected = `#![cfg(test)]

extern crate std;

use soroban_sdk::{ Env, String };

use crate::contract::{ NoArgs, NoArgsClient };

#[test]
fn initial_state() {
    let env = Env::default();

    let contract_addr = env.register(NoArgs, ());
    let client = NoArgsClient::new(&env, &contract_addr);

    assert_eq!(client.name(), String::from_str(&env, "NoArgs"));
}

// Add more tests bellow
`;
  t.is(output, expected);
});

test('printRustNameTest handles single address arg', t => {
  const contract = {
    name: 'SingleArg',
    constructorArgs: [{ name: 'owner', type: 'Address' }],
  };
  const output = printRustNameTest(contract);

  const expected = `#![cfg(test)]

extern crate std;

use soroban_sdk::{ testutils::Address as _, Address, Env, String };

use crate::contract::{ SingleArg, SingleArgClient };

#[test]
fn initial_state() {
    let env = Env::default();

    let contract_addr = env.register(SingleArg, (Address::generate(&env),));
    let client = SingleArgClient::new(&env, &contract_addr);

    assert_eq!(client.name(), String::from_str(&env, "SingleArg"));
}

// Add more tests bellow
`;
  t.is(output, expected);
});

test('printContractCargo output includes all dependencies and dev-dependencies forwarding to workspace', t => {
  const scaffoldContractName = 'test';
  const output = printContractCargo(scaffoldContractName);

  const expected = `[package]
name = "test-contract"
edition.workspace = true
license.workspace = true
publish = false
version.workspace = true

[lib]
crate-type = ["cdylib"]
doctest = false

[dependencies]
stellar-default-impl-macro = { workspace = true }
stellar-fungible = { workspace = true }
stellar-non-fungible = { workspace = true }
stellar-pausable = { workspace = true }
stellar-pausable-macros = { workspace = true }
stellar-upgradeable = { workspace = true }
stellar-upgradeable-macros = { workspace = true }
soroban-sdk = { workspace = true }

[dev-dependencies]
soroban-sdk = { workspace = true, features = ["testutils"] }
`;
  t.is(output, expected);
});
