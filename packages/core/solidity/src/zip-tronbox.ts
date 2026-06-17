import JSZip from 'jszip';
import type { GenericOptions } from './build-generic';
import type { Contract } from './contract';
import { printContract } from './print';
import { tronPrintProfile, TRON_SOLIDITY_VERSION } from './utils/transform-tron';
import { stringifyUnicodeSafe } from './utils/sanitize';
import { tronProxyFor, tronProxyHelperSource } from './utils/tron-upgradeable';

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
      return `// TODO: Replace with a real address (e.g. tronWeb.defaultAddress.base58).\n  const ${arg.name} = '<TRON address>';`;
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

// Deploys an upgradeable contract behind a proxy. OpenZeppelin's upgrades
// tooling targets EVM chains and does not deploy to TRON, so the proxy is
// deployed by hand per https://github.com/OpenZeppelin/tron-contracts-upgradeable.
function deployUpgradeableMigration(c: Contract): string {
  const proxy = tronProxyFor(c);
  const gated = hasUnsetArgs(c);
  const g = gated ? '// ' : '';

  const argDecls = c.constructorArgs.flatMap((arg, i) => {
    if (arg.type === 'address') {
      return [`  const ${arg.name} = accounts[${i}];`];
    }
    return [`  // TODO: Set the initialize() argument "${arg.name}".`, `  // const ${arg.name} = ...;`];
  });
  const argList = c.constructorArgs.map(a => a.name).join(', ');
  const adminDecl = proxy.isTransparent ? `  const proxyAdminOwner = accounts[0];\n\n` : '';
  const proxyArgs = proxy.isTransparent
    ? `implementation.address, proxyAdminOwner, initData`
    : `implementation.address, initData`;

  return `\
const ${c.name} = artifacts.require('./${c.name}.sol');
const ${proxy.contractName} = artifacts.require('${proxy.contractName}');

// OpenZeppelin's upgrades tooling targets EVM chains and does not deploy to
// TRON, so this migration deploys the proxy by hand: deploy the implementation,
// then a ${proxy.contractName} that delegates to it and runs initialize()
// atomically. Interact with the proxy address, never the implementation.
// See https://github.com/OpenZeppelin/tron-contracts-upgradeable
module.exports = async function (deployer, network, accounts) {
  // 1. Deploy the implementation. It is never called directly and cannot be
  //    initialized on its own (its constructor runs _disableInitializers()).
  await deployer.deploy(${c.name});
  const implementation = await ${c.name}.deployed();

${argDecls.length > 0 ? argDecls.join('\n') + '\n\n' : ''}${adminDecl}  // 2. ABI-encode the initializer call. TronBox is Truffle-derived; if your
  //    version doesn't expose \`.contract.methods\`, encode the initialize(...)
  //    call with tronWeb's ABI utilities instead.
${gated ? '  // TODO: Uncomment the lines below once the initialize() arguments above are set.\n' : ''}  ${g}const initData = implementation.contract.methods.initialize(${argList}).encodeABI();

  // 3. Deploy the proxy pointing at the implementation.
  ${g}await deployer.deploy(${proxy.contractName}, ${proxyArgs});
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

// For upgradeable contracts the deployed `${c.name}` artifact is the
// implementation; the initialized state lives in the proxy, so the test reads
// through the proxy address using the implementation's ABI.
function testFileUpgradeable(c: Contract, opts?: GenericOptions): string {
  const proxy = tronProxyFor(c);
  const assertion = kindAssertion(opts);

  return `\
const ${c.name} = artifacts.require('./${c.name}.sol');
const ${proxy.contractName} = artifacts.require('${proxy.contractName}');

// These tests require TronBox >= 4.1.x and the TronBox Runtime Environment
// (https://hub.docker.com/r/tronbox/tre) as your private network. The migration
// must have deployed the proxy (fill in any initialize() arguments first).
contract('${c.name}', function (accounts) {
  let instance;

  before(async function () {
    // Interact with the proxy address using the implementation's ABI.
    const proxy = await ${proxy.contractName}.deployed();
    instance = await ${c.name}.at(proxy.address);
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

function packageJson(c: Contract): unknown {
  // Upgradeable contracts pull their transpiled `*Upgradeable` parents from
  // tron-contracts-upgradeable; tron-contracts stays on as its peer (it also
  // provides the proxy the migration deploys).
  const dependencies: Record<string, string> = { '@openzeppelin/tron-contracts': '^0.0.1' };
  if (c.upgradeable) {
    dependencies['@openzeppelin/tron-contracts-upgradeable'] = '^0.0.1';
  }
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
    dependencies,
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
${
  c.upgradeable
    ? `
> :information_source: This is an upgradeable contract. OpenZeppelin's upgrades tooling targets EVM chains and does not deploy to TRON, so \`migrations/2_deploy_${c.name}.js\` deploys the proxy by hand: it deploys the \`${c.name}\` implementation, then a \`${tronProxyFor(c).contractName}\` that delegates to it and runs \`initialize()\` atomically. Interact with the **proxy** address, never the implementation. See the [upgradeable contracts guide](https://github.com/OpenZeppelin/tron-contracts-upgradeable).
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
    // Pull the proxy into the build so the migration can deploy ${c.name} behind it.
    zip.file('contracts/Proxy.sol', tronProxyHelperSource(c, TRON_SOLIDITY_VERSION));
  }

  zip.file('migrations/1_initial_migration.js', initialMigration);
  zip.file(`migrations/2_deploy_${c.name}.js`, c.upgradeable ? deployUpgradeableMigration(c) : deployMigration(c));

  zip.file(`test/${c.name}.js`, c.upgradeable ? testFileUpgradeable(c, opts) : testFile(c, opts));

  zip.file('tronbox-config.js', tronboxConfig);
  zip.file('package.json', JSON.stringify(packageJson(c), null, 2));
  zip.file('.gitignore', gitignore);
  zip.file('README.md', readme(c));

  return zip;
}
