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

// A smart account contacts its policy and verifier contracts while it is being
// constructed: `add_context_rule` installs every policy and canonicalizes every
// external signer key through its verifier. A test that registers the account
// therefore needs real contracts at those addresses, so the mocks below wrap the
// library's own logic, the same way the reference examples do.
const accountPolicies = {
  'simple-threshold': {
    struct: 'MockSimpleThresholdPolicy',
    module: 'simple_threshold',
    params: 'SimpleThresholdAccountParams',
  },
  'weighted-threshold': {
    struct: 'MockWeightedThresholdPolicy',
    module: 'weighted_threshold',
    params: 'WeightedThresholdAccountParams',
  },
} as const;

export type AccountPolicy = keyof typeof accountPolicies | false;

// How many of each signer type the generated test deploys with. `weights` must
// have one entry per assembled signer, so the counts drive that too.
const testSignerCounts = {
  delegated_signers: 2,
  ed25519_keys: 1,
  webauthn_keys: 1,
} as const;

const testConstructorArgValues: Record<string, (signerCount: number) => string> = {
  delegated_signers: () => 'Vec::from_array(&env, [Address::generate(&env), Address::generate(&env)])',
  ed25519_verifier: () => 'ed25519_verifier',
  ed25519_keys: () => 'Vec::from_array(&env, [Bytes::from_slice(&env, &[1u8; 32])])',
  webauthn_verifier: () => 'webauthn_verifier',
  // A WebAuthn key is the 65-byte secp256r1 public key followed by an optional
  // credential id; canonicalization reads the first 65 bytes.
  webauthn_keys: () => 'Vec::from_array(&env, [Bytes::from_slice(&env, &[2u8; 65])])',
  weights: signerCount => `Vec::from_array(&env, [${Array<string>(signerCount).fill('1u32').join(', ')}])`,
  threshold: () => '1u32',
  threshold_policy: () => 'policy',
};

const MOCK_ED25519_VERIFIER = `
// Minimal Ed25519 verifier contract.
#[contract]
pub struct MockEd25519Verifier;

#[contractimpl]
impl Verifier for MockEd25519Verifier {
    type KeyData = BytesN<32>;
    type SigData = BytesN<64>;

    fn verify(
        e: &Env,
        signature_payload: Bytes,
        key_data: BytesN<32>,
        sig_data: BytesN<64>,
    ) -> bool {
        ed25519::verify(e, &signature_payload, &key_data, &sig_data)
    }

    fn canonicalize_key(e: &Env, key_data: BytesN<32>) -> Bytes {
        ed25519::canonicalize_key(e, &key_data)
    }

    fn batch_canonicalize_key(e: &Env, keys_data: Vec<BytesN<32>>) -> Vec<Bytes> {
        ed25519::batch_canonicalize_key(e, &keys_data)
    }
}
`;

const MOCK_WEBAUTHN_VERIFIER = `
// Minimal WebAuthn (passkey) verifier contract.
#[contract]
pub struct MockWebauthnVerifier;

#[contractimpl]
impl Verifier for MockWebauthnVerifier {
    type KeyData = Bytes;
    type SigData = Bytes;

    fn verify(e: &Env, signature_payload: Bytes, key_data: Bytes, sig_data: Bytes) -> bool {
        let sig_struct =
            WebAuthnSigData::from_xdr(e, &sig_data).expect("WebAuthnSigData with correct format");
        let pub_key: BytesN<65> =
            extract_from_bytes(e, &key_data, 0..65).expect("65-byte public key to be extracted");

        webauthn::verify(e, &signature_payload, &pub_key, &sig_struct)
    }

    fn canonicalize_key(e: &Env, key_data: Bytes) -> Bytes {
        webauthn::canonicalize_key(e, &key_data)
    }

    fn batch_canonicalize_key(e: &Env, keys_data: Vec<Bytes>) -> Vec<Bytes> {
        webauthn::batch_canonicalize_key(e, &keys_data)
    }
}
`;

const printMockPolicyContract = (policy: keyof typeof accountPolicies) => {
  const { struct, module, params } = accountPolicies[policy];

  return `
// Minimal policy contract, needed because the account installs its policies
// during construction.
#[contract]
pub struct ${struct};

#[contractimpl]
impl Policy for ${struct} {
    type AccountParams = ${module}::${params};

    fn enforce(
        e: &Env,
        context: Context,
        authenticated_signers: Vec<Signer>,
        context_rule: ContextRule,
        smart_account: Address,
    ) {
        ${module}::enforce(e, &context, &authenticated_signers, &context_rule, &smart_account)
    }

    fn install(
        e: &Env,
        install_params: Self::AccountParams,
        context_rule: ContextRule,
        smart_account: Address,
    ) {
        ${module}::install(e, &install_params, &context_rule, &smart_account)
    }

    fn uninstall(e: &Env, context_rule: ContextRule, smart_account: Address) {
        ${module}::uninstall(e, &context_rule, &smart_account)
    }
}
`;
};

export const printAccountRustTest = (c: Pick<Contract, 'constructorArgs' | 'name'>, policy: AccountPolicy) => {
  const argNames = (c.constructorArgs || []).map(arg => arg.name);
  const signerCount = Object.entries(testSignerCounts).reduce(
    (total, [argName, count]) => (argNames.includes(argName) ? total + count : total),
    0,
  );

  const hasEd25519 = argNames.includes('ed25519_keys');
  const hasWebauthn = argNames.includes('webauthn_keys');
  const hasPolicy = policy !== false;

  // Every argument is spelled on its own line: the assembled tuple is otherwise
  // far too long to read.
  const registerArgs = argNames
    .map(argName => `            ${testConstructorArgValues[argName]!(signerCount)},`)
    .join('\n');

  const hasMocks = hasEd25519 || hasWebauthn || hasPolicy;

  const sorobanImports = [
    ...(hasPolicy ? ['auth::Context'] : []),
    ...(hasMocks ? ['contract', 'contractimpl'] : []),
    'testutils::Address as _',
    ...(hasWebauthn ? ['xdr::FromXdr'] : []),
    'Address',
    ...(hasEd25519 || hasWebauthn ? ['Bytes', 'BytesN'] : []),
    'Env',
    'Vec',
  ];

  // Kept on separate lines so that enabling both verifiers does not import
  // `Verifier` twice.
  const libImports = [
    ...(hasPolicy
      ? [
          `use stellar_accounts::policies::{ ${accountPolicies[policy].module}, Policy };`,
          'use stellar_accounts::smart_account::{ ContextRule, Signer };',
        ]
      : []),
    ...(hasEd25519 || hasWebauthn ? ['use stellar_accounts::verifiers::Verifier;'] : []),
    ...(hasEd25519 ? ['use stellar_accounts::verifiers::ed25519;'] : []),
    ...(hasWebauthn
      ? [
          'use stellar_accounts::verifiers::utils::extract_from_bytes;',
          'use stellar_accounts::verifiers::webauthn::{ self, WebAuthnSigData };',
        ]
      : []),
  ];

  const mockContracts = [
    ...(hasEd25519 ? [MOCK_ED25519_VERIFIER] : []),
    ...(hasWebauthn ? [MOCK_WEBAUTHN_VERIFIER] : []),
    ...(hasPolicy ? [printMockPolicyContract(policy)] : []),
  ];

  const registrations = [
    ...(hasEd25519 ? ['    let ed25519_verifier = env.register(MockEd25519Verifier, ());'] : []),
    ...(hasWebauthn ? ['    let webauthn_verifier = env.register(MockWebauthnVerifier, ());'] : []),
    ...(hasPolicy ? [`    let policy = env.register(${accountPolicies[policy].struct}, ());`] : []),
  ];

  return `#![cfg(test)]

extern crate std;

use soroban_sdk::{ ${sorobanImports.join(', ')} };
${libImports.map(libImport => `${libImport}\n`).join('')}
use crate::contract::{ ${c.name}, ${c.name}Client };
${mockContracts.join('')}
#[test]
fn initial_state() {
    let env = Env::default();
${hasPolicy ? '    env.mock_all_auths();\n' : ''}
${registrations.map(registration => `${registration}\n`).join('')}
    let contract_addr = env.register(
        ${c.name},
        (
${registerArgs}
        ),
    );
    let client = ${c.name}Client::new(&env, &contract_addr);

    assert_eq!(client.get_context_rules_count(), 1);
}

// Add more tests below
`;
};

const libDependencies = [
  'stellar-tokens',
  'stellar-access',
  'stellar-accounts',
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
