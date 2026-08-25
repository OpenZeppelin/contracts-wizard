import JSZip from 'jszip';
import type { GenericOptions } from './build-generic';
import type { Contract } from './contract';
import { printContract } from './print';
import { tronPrintProfile, TRON_SOLIDITY_VERSION } from './utils/transform-tron';
import { stringifyUnicodeSafe } from './utils/sanitize';
import { isUUPS } from './utils/tron-upgradeable';

// TronBox is a Truffle-derived framework for the TRON Virtual Machine. The
// download bundles:
//   - the contract source (rewritten for @openzeppelin/tron-contracts),
//   - migrations (`migrations/1_initial_migration.js`, `migrations/2_deploy_<Name>.js`),
//   - a Mocha-based test using `artifacts.require()`,
//   - `tronbox-config.js` configured for local TRE + Shasta/Nile/mainnet,
//   - `package.json` with TronBox + the OZ TRON contracts library.

// TRON_SOLIDITY_VERSION (imported) matches the printed pragma and the
// @openzeppelin/hardhat-tron README, so both download flavours stay aligned.

function getDeploymentArgs(c: Contract): string[] {
  // The arg name doubles as the local variable identifier declared above the
  // deploy call (see declareArgPlaceholders).
  return c.constructorArgs.map(arg => arg.name);
}

// Non-address args have no usable placeholder value, so the user must fill them
// in before deploying. Address args get the obviously-invalid '<TRON address>'
// sentinel, which compiles but fails loudly at deploy time if left unedited.
function hasUnsetArgs(c: Contract): boolean {
  return c.constructorArgs.some(arg => arg.type !== 'address');
}

function declareArgPlaceholders(c: Contract): string[] {
  return c.constructorArgs.map(arg => {
    if (arg.type === 'address') {
      return `// TODO: Set a TRON base58 address for the ${arg.name} constructor argument.\n  const ${arg.name} = '<TRON address>';`;
    }
    // No safe default — emit a commented-out declaration so the migration can
    // never silently deploy an `undefined` value.
    return `// TODO: Set the ${arg.name} constructor argument, then uncomment it and the deploy call below.\n  // const ${arg.name} = /* ... */;`;
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

  let deployCall: string;
  if (argList.length === 0) {
    deployCall = `deployer.deploy(${c.name});`;
  } else if (hasUnsetArgs(c)) {
    // At least one argument has no usable placeholder; leave the deploy call
    // commented out so an unedited `tronbox migrate` is a no-op rather than
    // deploying with missing values.
    deployCall = `// TODO: Uncomment once the constructor arguments above are set.\n  // deployer.deploy(${c.name}, ${argList.join(', ')});`;
  } else {
    deployCall = `deployer.deploy(${c.name}, ${argList.join(', ')});`;
  }

  return `\
const ${c.name} = artifacts.require('./${c.name}.sol');

module.exports = function (deployer) {
  ${declarations}${deployCall}
};
`;
}

// Builds a TronBox migration that validates and deploys through the upgrades plugin.
function deployUpgradeableMigration(c: Contract): string {
  const gated = hasUnsetArgs(c);
  const g = gated ? '// ' : '';
  const uups = isUUPS(c);

  const argDecls = c.constructorArgs.flatMap(arg => {
    if (arg.type === 'address') {
      return [
        `  // TODO: Set a TRON base58 address for the initialize() argument "${arg.name}".`,
        `  const ${arg.name} = toHex('<TRON address>');`,
      ];
    }
    return [`  // TODO: Set the initialize() argument "${arg.name}".`, `  // const ${arg.name} = ...;`];
  });
  // `tronWeb` is a file-scope global of the migration sandbox, so the arrow can
  // only dereference it once the migration runs.
  const toHexHelper = c.constructorArgs.some(arg => arg.type === 'address')
    ? `
// initialize() arguments are ABI-encoded, so addresses must be 0x-hex. Plugin
// options such as initialOwner take base58 and are converted for you.
const toHex = base58 => tronWeb.address.toHex(base58).replace(/^41/, '0x');
`
    : '';
  const argList = c.constructorArgs.map(a => a.name).join(', ');
  const adminDecl = !uups
    ? `  // TODO: Set a TRON base58 address for proxyAdminOwner.\n  const proxyAdminOwner = '<TRON address>';\n\n`
    : '';
  const deployOptions = uups
    ? `{ ...handles, kind: 'uups' }`
    : `{ ...handles, kind: 'transparent', initialOwner: proxyAdminOwner }`;

  return `\
const { deployProxy } = require('@openzeppelin/tronbox-upgrades');
const ${c.name} = artifacts.require('./${c.name}.sol');
${toHexHelper}
// Validates the implementation, deploys it behind a ${uups ? 'UUPS' : 'transparent'} proxy,
// and runs initialize() atomically.
module.exports = async function (deployer) {
  const handles = { deployer, artifacts, tronWrap, waitForTransactionReceipt };

${argDecls.length > 0 ? argDecls.join('\n') + '\n\n' : ''}${adminDecl}${gated ? '  // TODO: Uncomment the line below once the initialize() arguments above are set.\n' : ''}  ${g}const instance = await deployProxy(${c.name}, [${argList}], ${deployOptions});
  ${g}console.log('${c.name} (proxy) deployed to', instance.address);
};
`;
}

function kindAssertion(opts?: GenericOptions): string {
  if (opts !== undefined) {
    switch (opts.kind) {
      case 'ERC20':
      case 'ERC721':
        return `

  it('sets the expected name', async function () {
    assert.equal(await instance.name(), ${stringifyUnicodeSafe(opts.name)});
  });`;
      case 'ERC1155':
        return `

  it('sets the expected URI', async function () {
    assert.equal(await instance.uri(0), ${stringifyUnicodeSafe(opts.uri)});
  });`;
      default:
        break;
    }
  }
  return '';
}

// deployProxy writes the proxy address back to the contract abstraction, so
// `${c.name}.deployed()` returns the initialized proxy in later migrations/tests.
function testFileUpgradeable(c: Contract, opts?: GenericOptions): string {
  const assertion = kindAssertion(opts);

  return `\
const ${c.name} = artifacts.require('./${c.name}.sol');

// These tests require TronBox >= 4.8.x and the TronBox Runtime Environment
// (https://hub.docker.com/r/tronbox/tre) as your private network. The migration
// must have deployed the proxy (fill in any initialize() arguments first).
contract('${c.name}', function (accounts) {
  let instance;

  before(async function () {
    instance = await ${c.name}.deployed();
  });

  it('is deployed behind a proxy', async function () {
    assert.isTrue(accounts.length >= 1, 'At least one account is required.');
    assert.isOk(instance.address, 'Proxy address should be defined');
  });${assertion}
});
`;
}

function testFile(c: Contract, opts?: GenericOptions): string {
  const assertion = kindAssertion(opts);

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

async function packageJson(c: Contract): Promise<unknown> {
  // The upgradeable manifest adds tron-contracts-upgradeable (the transpiled
  // `*Upgradeable` parents) and the upgrades plugin that validates the
  // implementation and deploys the proxy, and requires a newer TronBox.
  const { default: packageJson } = c.upgradeable
    ? await import('./environments/tronbox/upgradeable/package.json')
    : await import('./environments/tronbox/package.json');
  return { ...packageJson, license: c.license };
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
- Install [TronBox](https://tronbox.io/docs/) globally${
    c.upgradeable ? ' (version 4.8.0 or newer)' : ''
  }: \`npm install -g tronbox\`

## Installing dependencies

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
${
  c.upgradeable
    ? `
> :information_source: This is an upgradeable contract. \`migrations/2_deploy_${c.name}.js\` uses \`@openzeppelin/tronbox-upgrades\` to validate the contract, deploy its implementation and proxy, and run \`initialize()\` atomically. Interact with the **proxy** address. Keep the generated \`.openzeppelin\` network files for future upgrades.
`
    : ''
}
## Testing

\`\`\`
tronbox test
\`\`\`

This will run the Mocha test in \`test/${c.name}.js\` against the configured network.
`;
}

export async function zipTronbox(c: Contract, opts?: GenericOptions): Promise<JSZip> {
  const zip = new JSZip();

  zip.file(`contracts/${c.name}.sol`, printContract(c, tronPrintProfile));
  zip.file('contracts/Migrations.sol', migrationsContract);
  if (c.upgradeable) {
    // TronBox only compiles the import closure of contracts/, and the plugin
    // deploys the proxies by artifact name.
    zip.file(
      'contracts/ProxyImports.sol',
      `// SPDX-License-Identifier: MIT
pragma solidity ^${TRON_SOLIDITY_VERSION};

// This file is needed so the toolchain compiles the proxy contracts, which
// @openzeppelin/tronbox-upgrades deploys by artifact name. Deploying a proxy
// fails without it.
import "@openzeppelin/tronbox-upgrades/contracts/Proxies.sol";
`,
    );
  }

  zip.file('migrations/1_initial_migration.js', initialMigration);
  zip.file(`migrations/2_deploy_${c.name}.js`, c.upgradeable ? deployUpgradeableMigration(c) : deployMigration(c));

  zip.file(`test/${c.name}.js`, c.upgradeable ? testFileUpgradeable(c, opts) : testFile(c, opts));

  zip.file('tronbox-config.js', tronboxConfig);
  zip.file('package.json', JSON.stringify(await packageJson(c), null, 2));
  zip.file('.gitignore', gitignore);
  zip.file('README.md', readme(c));

  return zip;
}
