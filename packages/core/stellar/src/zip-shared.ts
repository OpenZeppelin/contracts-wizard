import type { Contract } from './contract';
import { contractsVersion, compatibleSorobanVersion } from './utils/version';

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

// The vault's constructor takes an underlying asset address and derives its own
// decimals by calling into that asset contract. A generated address would have
// no `decimals()` to call, so the test deploys a minimal mock fungible asset
// first and registers the vault against it. A single-element tuple needs a
// trailing comma in Rust.
export const printVaultRustTest = (c: Pick<Contract, 'constructorArgs' | 'name'>) => {
  const registerArgs = (c.constructorArgs || []).map(arg =>
    arg.name === 'asset' ? 'asset_address.clone()' : 'Address::generate(&env)',
  );
  const registerTuple = `(${registerArgs.join(', ')}${registerArgs.length === 1 ? ',' : ''})`;

  return `#![cfg(test)]

extern crate std;

use soroban_sdk::{
    contract, contractimpl, testutils::Address as _, Address, Env, MuxedAddress, String,
};
use stellar_tokens::fungible::{Base, FungibleToken};

use crate::contract::{ ${c.name}, ${c.name}Client };

// Mock asset contract: a minimal fungible token used as the vault's underlying asset.
#[contract]
pub struct MockAssetContract;

#[contractimpl]
impl MockAssetContract {
    pub fn __constructor(e: &Env, initial_supply: i128, admin: Address) {
        Base::set_metadata(
            e,
            18,
            String::from_str(e, "Mock Asset Token"),
            String::from_str(e, "MAT"),
        );
        Base::mint(e, &admin, initial_supply);
    }
}

#[contractimpl(contracttrait)]
impl FungibleToken for MockAssetContract {
    type ContractType = Base;
}

#[test]
fn initial_state() {
    let env = Env::default();

    let admin = Address::generate(&env);
    let asset_address = env.register(MockAssetContract, (1_000_000_000i128, admin));

    let contract_addr = env.register(${c.name}, ${registerTuple});
    let client = ${c.name}Client::new(&env, &contract_addr);

    assert_eq!(client.query_asset(), asset_address);
    assert_eq!(client.name(), String::from_str(&env, "${c.name}"));
}

// Add more tests bellow
`;
};

const libDependencies = [
  'stellar-tokens',
  'stellar-access',
  'stellar-contract-utils',
  'stellar-governance',
  'stellar-macros',
] as const;

// Derives required lib crate dependencies from the contract's use clauses.
// Each use clause has a containerPath like "stellar_tokens::fungible::Base".
// We extract the first segment (the crate name), convert underscores to hyphens
// to match Cargo naming (e.g., stellar_tokens -> stellar-tokens), then filter
// libDependencies to include only crates the contract actually references.
// Filtering against the known list preserves stable ordering and ignores
// non-lib crates like soroban_sdk (which is always added separately).
export function getRequiredLibDependencies(c: Pick<Contract, 'useClauses'>): string[] {
  const usedCrates = new Set(c.useClauses.map(uc => uc.containerPath.split('::')[0]!.replace(/_/g, '-')));
  return libDependencies.filter(dep => usedCrates.has(dep));
}

export const addDependenciesWith = (dependencyValue: string, dependenciesToAdd: string[]) =>
  `${dependenciesToAdd.map(dependency => `${dependency} = ${dependencyValue}\n`).join('')}`;

export const printContractCargo = (scaffoldContractName: string, requiredLibDeps: readonly string[]) => `[package]
name = "${scaffoldContractName.replace(/_/, '-')}-contract"
edition.workspace = true
license.workspace = true
publish = false
version.workspace = true

[package.metadata.stellar]
cargo_inherit = true

[lib]
crate-type = ["cdylib"]
doctest = false

[dependencies]
${addDependenciesWith('{ workspace = true }', [...requiredLibDeps, 'soroban-sdk'])}
[dev-dependencies]
${addDependenciesWith('{ workspace = true, features = ["testutils"] }', ['soroban-sdk'])}`;

export const createRustLibFile = `#![no_std]
#![allow(dead_code)]

mod contract;
mod test;
`;

export const workspaceCargo = (requiredLibDeps: readonly string[]) => `[workspace]
resolver = "2"
members = ["contracts/*"]

[workspace.package]
authors = []
edition = "2021"
license = "Apache-2.0"
version = "0.0.1"

[workspace.dependencies]
${addDependenciesWith(`"${compatibleSorobanVersion}"`, ['soroban-sdk'])}${addDependenciesWith(`"=${contractsVersion}"`, [...requiredLibDeps])}

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true

[profile.release-with-logs]
inherits = "release"
debug-assertions = true
`;
