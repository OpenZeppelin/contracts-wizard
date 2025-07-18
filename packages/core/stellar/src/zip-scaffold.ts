import type JSZip from 'jszip';
import type { GenericOptions } from './build-generic';
import type { Contract } from './contract';
import { createRustZipEnvironment } from './zip-rust';

const setupSh = `\
#!/usr/bin/env bash
#
# setup.sh
#
# This script is meant to set up a Scaffold project with the Wizard's contracts

check_is_installed() {
  if ! which "$1" &> /dev/null; then
    echo "❌ $1 command not found."
    echo "Install $2 and try again, you can find installation guides in the README."
    exit 1
  fi
}

scaffold() {
  stellar-scaffold upgrade
}

init_git(){
  git init
  git add .
  git commit -m "openzeppelin: add wizard output" --quiet
}

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

  build_contracts

  install_npm_dependencies

  init_git

  echo "✅ Installation complete" 
else
  echo "✅ Scaffold project already initialized."
fi
`;

const wizardReadme = `\
# Sample Scaffold Project

This project demonstrates a basic Scaffold use case. It comes with a contract generated by [OpenZeppelin Wizard](https://wizard.openzeppelin.com/), a test for that contract, and a script that initiates a Stellar Scaffold project with this contract. [Scaffold Stellar](https://github.com/AhaLabs/scaffold-stellar?tab=readme-ov-file#scaffold-stellar) is a convention-over-configuration toolkit for blockchain and distributed application development on the Stellar network. It provides a seamless development experience through CLI tools, smart contract management, and deployment utilities.

## Installing dependencies

- See [Git installation guide](https://github.com/git-guides/install-git).
- See [Rust and Stellar installation guide](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup).
- See [Scaffold CLI installation guide](https://github.com/AhaLabs/scaffold-stellar?tab=readme-ov-file#quick-start).
- See [Docker installation guide](https://docs.docker.com/engine/install/).
- See [Node installation guide](https://nodejs.org/en/download).

## Initializing the project

\`\`\`
bash setup.sh
\`\`\`

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

const addScaffoldProjectFiles = (zip: JSZip) => {
  zip.file('README-WIZARD.md', wizardReadme);
  zip.file('setup.sh', setupSh);

  return zip;
};

export const zipScaffoldProject = async (c: Contract, opts: GenericOptions) =>
  addScaffoldProjectFiles(createRustZipEnvironment(c, opts));
