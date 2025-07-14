import type { Contract } from './contract';
import { contractsVersionTag, compatibleSorobanVersion, stellarDependencies } from './utils/version';

function pascalToSnakeCase(string: string) {
  return string
    .replace(/([A-Z])/g, '_$1')
    .replace(/^_/, '')
    .toLowerCase();
}

export const contractOptionsToContractName = pascalToSnakeCase;

export function getAddressArgs(c: Pick<Contract, 'constructorArgs'>): string[] {
  return (c.constructorArgs || [])
    .filter(constructorArg => constructorArg.type?.trim() === 'Address')
    .map(constructorArg => constructorArg.name);
}

export const printRustNameTest = (c: Pick<Contract, 'constructorArgs' | 'name'>) => `#![cfg(test)]

extern crate std;

use soroban_sdk::{ ${getAddressArgs(c).length ? 'testutils::Address as _, Address, ' : ''}Env, String };

use crate::contract::{ ${c.name}, ${c.name}Client };

#[test]
fn initial_state() {
    let env = Env::default();

    let contract_addr = env.register(${c.name}, (${getAddressArgs(c)
      .map(() => 'Address::generate(&env)')
      .join(',')}${getAddressArgs(c).length === 1 ? ',' : ''}));
    let client = ${c.name}Client::new(&env, &contract_addr);

    assert_eq!(client.name(), String::from_str(&env, "${c.name}"));
}

// Add more tests bellow
`;

const getKeysOf = <TObject extends Record<string, unknown>>(objectToGetKeysOf: TObject) =>
  Object.keys(objectToGetKeysOf) as (keyof TObject)[];

export const allStellarDependencies = getKeysOf(stellarDependencies);

export const allDependencies = {
  ...stellarDependencies,
  soroban: ['soroban-sdk'],
} as const;

export const addDependenciesWith = (dependencyValue: string, dependenciesToAdd: (keyof typeof allDependencies)[]) =>
  dependenciesToAdd.reduce((addedDependency, dependencyName) => {
    return `${addedDependency}${allDependencies[dependencyName].map(cargoDependencies => `${cargoDependencies} = ${dependencyValue}\n`).join('')}`;
  }, '');

export const printContractCargo = (scaffoldContractName: string) => `[package]
name = "${scaffoldContractName.replace(/_/, '-')}-contract"
edition.workspace = true
license.workspace = true
publish = false
version.workspace = true

[lib]
crate-type = ["cdylib"]
doctest = false

[dependencies]
${addDependenciesWith('{ workspace = true }', [...allStellarDependencies, 'soroban'])}
[dev-dependencies]
${addDependenciesWith('{ workspace = true, features = ["testutils"] }', ['soroban'])}`;

export const createRustLibFile = `#![no_std]
#![allow(dead_code)]

mod contract;
mod test;
`;

export const workspaceCargo = `[workspace]
resolver = "2"
members = ["contracts/*"]

[workspace.package]
authors = []
edition = "2021"
license = "Apache-2.0"
version = "0.0.1"

[workspace.dependencies]
${addDependenciesWith(`{ git = "https://github.com/OpenZeppelin/stellar-contracts", tag = "${contractsVersionTag}" }`, allStellarDependencies)}${addDependenciesWith(`{ version = "${compatibleSorobanVersion}" }`, ['soroban'])}
`;
