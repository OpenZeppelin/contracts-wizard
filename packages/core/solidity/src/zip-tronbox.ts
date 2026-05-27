import JSZip from 'jszip';
import type { GenericOptions } from './build-generic';
import type { Contract, FunctionArgument } from './contract';
import { printContract } from './print';
import { rewriteForTron } from './utils/transform-tron';
import { stringifyUnicodeSafe } from './utils/sanitize';

// TronBox is a Truffle-derived framework for the TRON Virtual Machine. The
// download bundles:
//   - the contract source (rewritten for @openzeppelin/tron-contracts),
//   - migrations (`migrations/1_initial_migration.js`, `migrations/2_deploy_<Name>.js`),
//   - a Mocha-based test using `artifacts.require()`,
//   - `tronbox-config.js` configured for local TRE + Shasta/Nile/mainnet,
//   - `package.json` with TronBox + the OZ TRON contracts library.

// Matches the README of @openzeppelin/hardhat-tron so both download flavours stay aligned.
const TRON_SOLIDITY_VERSION = '0.8.26';

function getDeploymentArgs(c: Contract): string[] {
  return c.constructorArgs.map(arg => placeholderForArg(arg));
}

function placeholderForArg(arg: FunctionArgument): string {
  // Use the arg name as a local variable identifier; we declare placeholders
  // above the deploy call so the user knows what to fill in.
  return arg.name;
}

function declareArgPlaceholders(c: Contract): string[] {
  return c.constructorArgs.map(arg => {
    if (arg.type === 'address') {
      return `// TODO: Replace with a real address (e.g. tronWeb.defaultAddress.base58).\n  const ${arg.name} = '<TRON address>';`;
    }
    return `// TODO: Set value for the ${arg.name} constructor argument.\n  const ${arg.name} = undefined;`;
  });
}

const migrationsContract = `\
// SPDX-License-Identifier: MIT
pragma solidity ^${TRON_SOLIDITY_VERSION};

contract Migrations {
    address public owner = msg.sender;
    uint public last_completed_migration;

    modifier restricted() {
        require(msg.sender == owner, "Restricted to owner");
        _;
    }

    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }
}
`;

const initialMigration = `\
const Migrations = artifacts.require('./Migrations.sol');

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
`;

function deployMigration(c: Contract): string {
  const argDecls = declareArgPlaceholders(c);
  const argList = getDeploymentArgs(c);

  const declarations = argDecls.length > 0 ? argDecls.join('\n  ') + '\n\n  ' : '';
  const deployCall =
    argList.length > 0 ? `deployer.deploy(${c.name}, ${argList.join(', ')});` : `deployer.deploy(${c.name});`;

  return `\
const ${c.name} = artifacts.require('./${c.name}.sol');

module.exports = function (deployer) {
  ${declarations}${deployCall}
};
`;
}

function testFile(c: Contract, opts?: GenericOptions): string {
  let assertion = '';
  if (opts !== undefined) {
    switch (opts.kind) {
      case 'ERC20':
      case 'ERC721':
        assertion = `

  it('sets the expected name', async function () {
    assert.equal(await instance.name(), ${stringifyUnicodeSafe(opts.name)});
  });`;
        break;
      case 'ERC1155':
        assertion = `

  it('sets the expected URI', async function () {
    assert.equal(await instance.uri(0), ${stringifyUnicodeSafe(opts.uri)});
  });`;
        break;
      default:
        break;
    }
  }

  const constructorArgNote =
    c.constructorArgs.length > 0
      ? `// NOTE: this contract has constructor arguments. Update the placeholders in
//       migrations/2_deploy_${c.name}.js before running 'tronbox test'.
`
      : '';

  return `\
const ${c.name} = artifacts.require('./${c.name}.sol');

// These tests require TronBox >= 4.1.x and the TronBox Runtime Environment
// (https://hub.docker.com/r/tronbox/tre) as your private network.
${constructorArgNote}contract('${c.name}', function (accounts) {
  let instance;

  before(async function () {
    instance = await ${c.name}.deployed();
  });

  it('is deployed', async function () {
    assert.isTrue(accounts.length >= 1, 'At least one account is required.');
    assert.isOk(instance.address, 'Contract address should be defined');
  });${assertion}
});
`;
}

const tronboxConfig = `\
// tronbox-config.js
//
// TronBox configuration for projects targeting TRON. Run with one of:
//
//   tronbox migrate --network development   # local TRE in Docker
//   tronbox migrate --network shasta        # Shasta testnet
//   tronbox migrate --network nile          # Nile testnet
//   tronbox migrate --network mainnet       # TRON mainnet
//
// Create a .env file (gitignored!) with PRIVATE_KEY_* values before deploying
// to any non-development network.

module.exports = {
  networks: {
    development: {
      // For tronbox/tre docker image: https://hub.docker.com/r/tronbox/tre
      privateKey: '0000000000000000000000000000000000000000000000000000000000000001',
      userFeePercentage: 0,
      feeLimit: 1000 * 1e6,
      fullHost: 'http://127.0.0.1:9090',
      network_id: '9',
    },
    shasta: {
      privateKey: process.env.PRIVATE_KEY_SHASTA,
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2',
    },
    nile: {
      privateKey: process.env.PRIVATE_KEY_NILE,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://nile.trongrid.io',
      network_id: '3',
    },
    mainnet: {
      privateKey: process.env.PRIVATE_KEY_MAINNET,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1',
    },
  },
  compilers: {
    solc: {
      version: '${TRON_SOLIDITY_VERSION}',
      settings: {
        optimizer: { enabled: true, runs: 200 },
        evmVersion: 'cancun',
      },
    },
  },
};
`;

function packageJson(c: Contract): unknown {
  return {
    name: 'tronbox-sample',
    version: '0.0.1',
    description: 'Sample TronBox project generated by OpenZeppelin Contracts Wizard',
    license: c.license,
    scripts: {
      compile: 'tronbox compile',
      migrate: 'tronbox migrate',
      test: 'tronbox test',
      console: 'tronbox console',
    },
    devDependencies: {
      tronbox: '^4.1.0',
    },
    dependencies: {
      '@openzeppelin/tron-contracts': '^0.1.0',
    },
  };
}

const gitignore = `\
node_modules
build
.env
`;

function readme(c: Contract): string {
  return `\
# Sample TronBox Project

This project demonstrates a basic TronBox use case. It comes with a contract generated by [OpenZeppelin Wizard](https://wizard.openzeppelin.com/), a migration that deploys it, and a Mocha test.

## Prerequisites

- [Node.js 18+](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/) — runs the local TRON Runtime Environment (\`tronbox/tre\`)
- Install [TronBox](https://tronbox.io/docs/) globally: \`npm install -g tronbox\`

## Installing dependencies

> :warning: Temporary limitation: this template depends on \`@openzeppelin/tron-contracts\`, which may not yet be available on the public npm registry. If \`npm install\` fails with a 404 for that package, retry after it is published, or install it from a local checkout / git URL in the meantime.

\`\`\`
npm install
\`\`\`

## Running a local TRON node

In a separate terminal:

\`\`\`
docker run --rm -p 9090:9090 tronbox/tre
\`\`\`

## Compiling

\`\`\`
tronbox compile
\`\`\`

## Deploying

\`\`\`
tronbox migrate --network development
\`\`\`

For Shasta/Nile/mainnet, set the corresponding \`PRIVATE_KEY_*\` env var in a \`.env\` file and pass \`--network <name>\`.

## Testing

\`\`\`
tronbox test
\`\`\`

This will run the Mocha test in \`test/${c.name}.js\` against the configured network.
`;
}

export async function zipTronbox(c: Contract, opts?: GenericOptions): Promise<JSZip> {
  const zip = new JSZip();

  zip.file(`contracts/${c.name}.sol`, rewriteForTron(printContract(c)));
  zip.file('contracts/Migrations.sol', migrationsContract);

  zip.file('migrations/1_initial_migration.js', initialMigration);
  zip.file(`migrations/2_deploy_${c.name}.js`, deployMigration(c));

  zip.file(`test/${c.name}.js`, testFile(c, opts));

  zip.file('tronbox-config.js', tronboxConfig);
  zip.file('package.json', JSON.stringify(packageJson(c), null, 2));
  zip.file('.gitignore', gitignore);
  zip.file('README.md', readme(c));

  return zip;
}
