import JSZip from 'jszip';
import type { GenericOptions } from './build-generic';
import type { Contract } from './contract';
import { printContract, removeCreateLevelAttributes } from './print';
import { compatibleSorobanVersion, contractsVersionTag } from './utils/version';

const getKeysOf = <TObject extends Record<string, unknown>>(objectToGetKeysOf: TObject) =>
  Object.keys(objectToGetKeysOf) as (keyof TObject)[];

const stellarDependencies = {
  base: ['stellar-default-impl-macro'],
  fungible: ['stellar-fungible'],
  nonFungible: ['stellar-non-fungible'],
  pausable: ['stellar-pausable', 'stellar-pausable-macros'],
  upgradable: ['stellar-upgradeable', 'stellar-upgradeable-macros'],
} as const;

const allStellarDependencies = getKeysOf(stellarDependencies);

const allDependencies = {
  ...stellarDependencies,
  soroban: ['soroban-sdk'],
} as const;

const addDependenciesWith = (dependencyValue: string, dependenciesToAdd: (keyof typeof allDependencies)[]) =>
  dependenciesToAdd.reduce((addedDependency, dependencyName) => {
    return `${addedDependency}${allDependencies[dependencyName].map(cargoDependencies => `${cargoDependencies} = ${dependencyValue}\n`).join('')}`;
  }, '');

const test = (c: Contract) => `#![cfg(test)]

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

function contractCargo(opts: GenericOptions, scaffoldContractName: string) {
  return `[package]
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
${addDependenciesWith('{ workspace = true, features = ["testutils"] }', ['soroban'])}
`;
}

function pascalToSnakeCase(string: string) {
  return string
    .replace(/([A-Z])/g, '_$1')
    .replace(/^_/, '')
    .toLowerCase();
}

export const contractOptionsToScaffoldContractName = pascalToSnakeCase;

function getAddressArgs(c: Contract): string[] {
  return c.constructorArgs
    .filter(constructorArg => constructorArg.type?.toLowerCase() === 'address')
    .map(constructorArg => constructorArg.name);
}

const setupSh = (c: Contract, opts: GenericOptions, scaffoldContractName: string) => {
  const environmentsFileUpdate = (setUpContract: Contract, setUpScaffoldContractName: string) => `
# Update environments.toml: remove original contracts and insert wizard's contract
setup_environment() {
  local file="environments.toml"
  local temp
  temp="$(mktemp)"

  local in_dev_contracts=0
  local skip_entry=0
  local contract_entry_inserted=0
  insert_contract_entry() {
    {
      printf '%s\\n' "[development.contracts.${setUpScaffoldContractName}_contract]" \\
        "client = true" "" \\
        "# If your contract has a \\\`__constructor\\\`, specify your arguments to it here." \\
        "# These are the same arguments you could pass after the \\\`--\\\` in a call to" \\
        "# \\\`stellar contract deploy\\\`" \\
        "# Only available in \\\`development\\\` and \\\`test\\\` environments" \\
        ${
          setUpContract.constructorArgs.length
            ? // Mind the spacing
              `"# TODO add appropriate values for for the constructors arguments" \\
        "constructor_args = \\"\\"\\"" \\
        "${setUpContract.constructorArgs.map(constructorArg => `--${constructorArg.name} \\"ADD_${constructorArg.name.toLocaleUpperCase()}_${constructorArg.type?.toLocaleUpperCase() || 'ARGUMENT'}_HERE\\"`).join(' ')}" \\
        "\\"\\"\\"" \\
        ""`
            : '""'
        }
    } >> "$temp"
  }

  while IFS= read -r line; do
    if [[ $contract_entry_inserted -eq 0 && $line == '[staging.network]' ]]; then
      insert_contract_entry
      contract_entry_inserted=1
    fi

    if [[ $line =~ ^\\[development\\.contracts\\]$ ]]; then
      printf '%s\\n' "$line" >> "$temp"
      in_dev_contracts=1
      skip_entry=0
      continue
    fi

    if [[ $line =~ ^\\[[^]]+\\]$ ]]; then
      if (( in_dev_contracts )) && [[ $line =~ ^\\[development\\.contracts\\..+\\]$ ]]; then
        skip_entry=1
        in_dev_contracts=0
        continue
      fi
      in_dev_contracts=0
      skip_entry=0
      printf '%s\\n' "$line" >> "$temp"
      continue
    fi

    if (( skip_entry )); then
      continue
    fi

    if (( in_dev_contracts )); then
      if [[ $line =~ ^[[:space:]]*# ]]; then
        printf '%s\\n' "$line" >> "$temp"
      fi
      continue
    fi

    printf '%s\\n' "$line" >> "$temp"
  done < "$file"

  mv "$temp" "$file"
}
`;

  const updateWorkspaceCargo = (opts: GenericOptions) => `update_cargo() {
  cp Cargo.toml Cargo.toml.bak

  cat <<EOF > deps.tmp
${addDependenciesWith(`{ git = "https://github.com/OpenZeppelin/stellar-contracts", tag = "${contractsVersionTag}" }`, allStellarDependencies)}${addDependenciesWith(`{ version = "${compatibleSorobanVersion}" }`, ['soroban'])}
EOF

  awk '
    BEGIN {
      inserted = 0
      deps = ""
      while ((getline line < "deps.tmp") > 0) {
        deps = deps line "\\n"
      }
      close("deps.tmp")
    }
    /^\\[workspace.dependencies\\]/ {
      in_deps = 1
      print
      if (!inserted) {
        printf "%s", deps
        inserted = 1
      }
      next
    }
    /^\\[/ { in_deps = 0 }
    in_deps { next }
    { print }
  ' Cargo.toml.bak > Cargo.toml

  rm deps.tmp
  rm Cargo.toml.bak
}`;

  return `\
#!/usr/bin/env bash
#
# setup.sh
# 
# This script is meant to set up a Scaffold project and insert the Wizard's contracts in the project

check_is_installed() {
  if ! which "$1" &> /dev/null; then
    echo "❌ $1 command not found."
    echo "Install $2 and try again, you can find installation guides in the README."
    exit 1
  fi
}

scaffold() {
  tmp_folder="tmp"
  stellar scaffold init "$tmp_folder"

  rm -rf "$tmp_folder/contracts"

  local current_directory
  current_directory="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

  shopt -s dotglob

  cp -a "$current_directory/$tmp_folder"/. "$current_directory"/
  rm -rf "$current_directory/$tmp_folder"
}

init_git(){
  git init
  git add .
  git commit -m "openzeppelin: add wizard output" --quiet
}

${environmentsFileUpdate(c, scaffoldContractName)}

${updateWorkspaceCargo(opts)}

build_contracts() {
  cargo build
}

install_npm_dependencies() {
  if ! npm install --silent; then
    echo "❌ Failed to set up the project."
    exit 1
  fi
}


################
##### Start ####
################

echo "⚙️ Checking dependencies requirement"
check_is_installed git "Git"
check_is_installed cargo "Rust"
check_is_installed stellar "Scaffold"
check_is_installed docker "Docker"
check_is_installed node "Node"


if ! [ -f "environments.toml" ]
then
  echo "🏗️ Building Scaffold project"

  scaffold
  
  setup_environment

  update_cargo

  build_contracts

  install_npm_dependencies

  init_git

  echo "✅ Installation complete" 
else
  echo "✅ Scaffold project already initialized."
fi
`;
};

const readme = (c: Contract) => {
  const hasTodosToResolve = (c: Contract) => getAddressArgs(c).length > 0;

  return `\
# Sample Scaffold Project

This project demonstrates a basic Scaffold use case. It comes with a contract generated by [OpenZeppelin Wizard](https://wizard.openzeppelin.com/), a test for that contract, and a script that initiate a Stellar Scaffold project with this contract. [Scaffold Stellar](https://github.com/AhaLabs/scaffold-stellar?tab=readme-ov-file#scaffold-stellar) is a convention-over-configuration toolkit for blockchain and distributed application development on the Stellar network. It provides a seamless development experience through CLI tools, smart contract management, and deployment utilities.

## Installing dependencies

- See [Git installation guide](https://github.com/git-guides/install-git).
- See [Rust installation guide](https://www.rust-lang.org/tools/install).
- See [Scaffold CLI installation guide](https://github.com/AhaLabs/scaffold-stellar?tab=readme-ov-file#quick-start).
- See [Docker installation guide](https://docs.docker.com/engine/install/).
- See [Node installation guide](https://nodejs.org/en/download).

## Initializing the project

\`\`\`
bash setup.sh
\`\`\`
${hasTodosToResolve(c) ? '\n## Resolve any TODOs \n\nSearch for any TODO comments in the project and resolve them (search for TODO with your code editor).\n' : ''}

## Testing the contract

\`\`\`
cargo test
\`\`\`

## Deploying the contract

\`\`\`
stellar scaffold watch --build-clients
\`\`\`

## Deploying the contract and run the Scaffold UI app

\`\`\`
npm run dev
\`\`\`
`;
};

const createLib = `#![no_std]
#![allow(dead_code)]

mod contract;
mod test;
`;

export async function zipScaffold(c: Contract, opts: GenericOptions) {
  const zip = new JSZip();

  const scaffoldContractName = contractOptionsToScaffoldContractName(opts?.kind || 'contract');

  zip.file(`contracts/${scaffoldContractName}/src/contract.rs`, removeCreateLevelAttributes(printContract(c)));
  zip.file(`contracts/${scaffoldContractName}/src/test.rs`, test(c));
  zip.file(`contracts/${scaffoldContractName}/src/lib.rs`, createLib);
  zip.file(`contracts/${scaffoldContractName}/Cargo.toml`, contractCargo(opts, scaffoldContractName));
  zip.file('setup.sh', setupSh(c, opts, scaffoldContractName));
  zip.file('README-WIZARD.md', readme(c));

  return zip;
}
