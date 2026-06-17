import JSZip from 'jszip';
import type { Contract } from './contract';
import { HardhatZipGenerator } from './zip-hardhat';
import type { GenericOptions } from './build-generic';
import { printContract } from './print';
import { rewriteForTron } from './utils/transform-tron';
import { tronProxyFor, tronProxyHelperSource, hasUnsetInitArgs } from './utils/tron-upgradeable';

// Solidity version used by @openzeppelin/hardhat-tron and openzeppelin/tron-contracts.
// `tron-solc` 0.8.26 + cancun + viaIR is what the TRON Democritus hardfork
// (post-GreatVoyage 4.7) targets, and matches the README of OpenZeppelin/hardhat-tron.
const TRON_SOLIDITY_VERSION = '0.8.26';

class HardhatTronZipGenerator extends HardhatZipGenerator {
  protected override getAdditionalHardhatImports(): string[] {
    // hardhat-tron does NOT use @nomicfoundation/hardhat-toolbox; the plugin
    // composes the smaller ethers + chai-matchers plugins that it actually needs.
    return ['@nomicfoundation/hardhat-ethers', '@nomicfoundation/hardhat-chai-matchers', '@openzeppelin/hardhat-tron'];
  }

  protected override getHardhatConfigJsonString(): string {
    return `\
{
  solidity: {
    version: "${TRON_SOLIDITY_VERSION}",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'cancun',
      viaIR: true,
      // Embed source as literal text in metadata so verification
      // services (Sourcify, etc.) can reconstruct it deterministically.
      metadata: { bytecodeHash: 'ipfs', useLiteralContent: true },
    },
  },
  tre: {
    autoStart: true,
    image: 'tronbox/tre:dev',
    compiler: { target: 'tron' },
  },
  defaultNetwork: 'tre',
  networks: {
    tre: {
      url: process.env.TRE_URL || 'http://127.0.0.1:9090/jsonrpc',
      tron: true,
      // Default well-known TRE dev key — fine for local tests, NEVER use on a real network.
      accounts: [process.env.TRE_PRIVATE_KEY || '0xdd23ca549a97cb330b011aebb674730df8b14acaee42d211ab45692699ab8ba5'],
    },
  },
}`;
  }

  protected override getHardhatConfig(_upgradeable: boolean): string {
    // hardhat-tron-based projects use a non-upgradeable single config; the
    // `@openzeppelin/hardhat-upgrades` plugin is not used here. The hardhat
    // config is also emitted as a CommonJS .cjs file in the README sample,
    // but the TypeScript .ts variant works just as well with hardhat-tron.
    const additionalImports = this.getAdditionalHardhatImports();
    const importsSection = additionalImports.map(imp => `import "${imp}";`).join('\n');

    return `\
import { HardhatUserConfig } from "hardhat/config";
${importsSection}

const config: HardhatUserConfig = ${this.getHardhatConfigJsonString()};

export default config;
`;
  }

  protected override async getPackageJson(c: Contract): Promise<unknown> {
    const { default: packageJson } = await import('./environments/hardhat/tron/package.json');
    // Build a fresh object so we never mutate the shared module-level import.
    const devDependencies: Record<string, string> = { ...packageJson.devDependencies };
    if (c.upgradeable) {
      // Upgradeable contracts pull their transpiled `*Upgradeable` parents from
      // tron-contracts-upgradeable; tron-contracts (already present) stays on as
      // its peer for the proxy utilities and interfaces.
      devDependencies['@openzeppelin/tron-contracts-upgradeable'] = '^0.0.1';
    }
    return { ...packageJson, license: c.license, devDependencies };
  }

  protected override async getPackageLock(_c: Contract): Promise<unknown> {
    // Not used. The TRON variant skips emitting a package-lock.json because
    // @openzeppelin/hardhat-tron and @openzeppelin/tron-contracts are not yet
    // published to the npm registry, so a lockfile would dangle. `npm install`
    // resolves the dependencies fresh when the packages are available.
    return undefined;
  }

  protected override getReadmePrerequisitesSection(): string {
    return `\
## Prerequisites

Ensure you have the following installed:
- [Node.js 20+](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/) — the TRON Runtime Environment (\`tronbox/tre:dev\`) is spawned as a Docker container by \`@openzeppelin/hardhat-tron\`.

`;
  }

  protected override getReadmeTestingEnvironmentSetupSection(): string {
    return `\
## TRON Runtime Environment

\`@openzeppelin/hardhat-tron\` spawns a local \`java-tron\` node (TRE) in Docker the first time you run \`npx hardhat test\` and tears it down on exit. No manual setup is required.

`;
  }

  protected override getGitIgnoreHardhatIgnition(): string {
    // hardhat-ignition is not in scope for the TRON variant — we emit a plain
    // ethers script instead. Nothing to gitignore here.
    return '';
  }

  protected override getPrintContract(c: Contract): string {
    return rewriteForTron(printContract(c));
  }

  protected override getReadme(c: Contract): string {
    return `\
# Sample TRON Hardhat Project (${c.name})

This project demonstrates a TRON-targeted Hardhat use case using \`@openzeppelin/hardhat-tron\`. It comes with the \`${c.name}\` contract generated by [OpenZeppelin Wizard](https://wizard.openzeppelin.com/), a test for that contract, and a deploy script.

${this.getReadmePrerequisitesSection()}## Installing dependencies

> :warning: Temporary limitation: this template depends on \`@openzeppelin/hardhat-tron\` and \`@openzeppelin/tron-contracts\`, which may not yet be available on the public npm registry. If \`npm install\` fails with a 404 for either package, retry after they are published, or install them from a local checkout / git URL in the meantime.

\`\`\`
npm install
\`\`\`

${this.getReadmeTestingEnvironmentSetupSection()}## Testing the contract

\`\`\`
npm test
\`\`\`

## Deploying the contract

\`\`\`
npx hardhat run --network tre scripts/deploy.ts
\`\`\`

The default \`tre\` network in \`hardhat.config.ts\` points at a local TRON Runtime Environment (Docker container, spawned automatically by \`@openzeppelin/hardhat-tron\`). For Shasta, Nile, or mainnet, add a network entry and pass \`--network <name>\`.
${
  c.upgradeable
    ? `
> :information_source: This is an upgradeable contract. OpenZeppelin's Hardhat Upgrades plugin targets EVM chains and does not deploy to TRON, so \`scripts/deploy.ts\` deploys the proxy by hand: it deploys the \`${c.name}\` implementation, then a \`${tronProxyFor(c).contractName}\` that delegates to it and runs \`initialize()\` atomically. Interact with the **proxy** address it prints, never the implementation. See the [upgradeable contracts guide](https://github.com/OpenZeppelin/tron-contracts-upgradeable).
`
    : ''
}`;
  }

  // hardhat-tron does not bundle `@openzeppelin/hardhat-upgrades` (the Upgrades
  // plugins don't support TRON), so the deploy script/test never reference an
  // `upgrades` object. Override the base list to drop it even when upgradeable.
  public override getHardhatPlugins(_c: Contract): string[] {
    return ['ethers'];
  }

  protected override getScript(c: Contract): string {
    // For upgradeable contracts we deploy the proxy by hand (see header note on
    // `tron-upgradeable.ts`); the base `upgrades.deployProxy` flow is EVM-only.
    return c.upgradeable ? this.getUpgradeableScript(c) : super.getScript(c);
  }

  protected override getTest(c: Contract, opts?: GenericOptions): string {
    return c.upgradeable ? this.getUpgradeableTest(c, opts) : super.getTest(c, opts);
  }

  // Declares the `initialize(...)` arguments above the proxy deployment. Address
  // args default to a local signer; non-address args are left as commented-out
  // TODOs (there's no safe default), which also flips `hasUnsetInitArgs`.
  private declareInitArgs(c: Contract): string[] {
    return c.constructorArgs.flatMap((arg, i) => {
      if (arg.type === 'address') {
        return [`  const ${arg.name} = (await ethers.getSigners())[${i}].address;`];
      }
      return [`  // TODO: Set the initialize() argument "${arg.name}".`, `  // const ${arg.name} = ...;`];
    });
  }

  private getUpgradeableScript(c: Contract): string {
    const proxy = tronProxyFor(c);
    const gated = hasUnsetInitArgs(c);
    const g = gated ? '// ' : '';

    const argDecls = this.declareInitArgs(c);
    const argList = c.constructorArgs.map(a => a.name).join(', ');
    const adminDecl = proxy.isTransparent
      ? `  // The transparent proxy's admin owner — it alone can upgrade the proxy.\n  const proxyAdminOwner = (await ethers.getSigners())[0].address;\n\n`
      : '';
    const proxyArgs = proxy.isTransparent
      ? 'implementationAddress, proxyAdminOwner, initData'
      : 'implementationAddress, initData';

    return `\
import { ethers } from "hardhat";

// OpenZeppelin's Hardhat Upgrades plugin does not support TRON, so this script
// deploys the proxy manually: deploy the implementation, then deploy a
// ${proxy.contractName} that delegates to it and runs initialize() atomically.
async function main() {
  // 1. Deploy the implementation. It is never called directly — all calls go
  //    through the proxy — and it cannot be initialized on its own because its
  //    constructor runs _disableInitializers().
  const Implementation = await ethers.getContractFactory("${c.name}");
  const implementation = await Implementation.deploy();
  await implementation.waitForDeployment();
  const implementationAddress = await implementation.getAddress();
  console.log(\`Implementation deployed to \${implementationAddress}\`);

${argDecls.length > 0 ? argDecls.join('\n') + '\n\n' : ''}${adminDecl}  // 2. ABI-encode the initializer so it runs in the proxy's storage on deploy.
${gated ? '  // TODO: Uncomment the lines below once the initialize() arguments above are set.\n' : ''}  ${g}const initData = Implementation.interface.encodeFunctionData("initialize", [${argList}]);

  // 3. Deploy the proxy pointing at the implementation.
  ${g}const Proxy = await ethers.getContractFactory("${proxy.contractName}");
  ${g}const proxy = await Proxy.deploy(${proxyArgs});
  ${g}await proxy.waitForDeployment();

  ${g}console.log(\`${c.name} (proxy) deployed to \${await proxy.getAddress()}\`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;
  }

  private getUpgradeableTest(c: Contract, opts?: GenericOptions): string {
    const proxy = tronProxyFor(c);
    const gated = hasUnsetInitArgs(c);
    const g = gated ? '// ' : '';

    const argDecls = this.declareInitArgs(c).map(line => '  ' + line);
    const argList = c.constructorArgs.map(a => a.name).join(', ');
    const adminDecl = proxy.isTransparent
      ? `    const proxyAdminOwner = (await ethers.getSigners())[0].address;\n`
      : '';
    const proxyArgs = proxy.isTransparent
      ? 'implementationAddress, proxyAdminOwner, initData'
      : 'implementationAddress, initData';

    let assertion = '';
    if (opts !== undefined) {
      switch (opts.kind) {
        case 'ERC20':
        case 'ERC721':
          assertion = `    ${g}expect(await instance.name()).to.equal(${JSON.stringify(opts.name)});`;
          break;
        case 'ERC1155':
          assertion = `    ${g}expect(await instance.uri(0)).to.equal(${JSON.stringify(opts.uri)});`;
          break;
        default:
          break;
      }
    }

    return `\
import { expect } from "chai";
import { ethers } from "hardhat";

describe("${c.name}", function () {
  it("deploys behind a proxy and initializes", async function () {
    const Implementation = await ethers.getContractFactory("${c.name}");
    const implementation = await Implementation.deploy();
    await implementation.waitForDeployment();
    const implementationAddress = await implementation.getAddress();

${argDecls.length > 0 ? argDecls.join('\n') + '\n' : ''}${adminDecl}${gated ? '    // TODO: Uncomment the lines below once the initialize() arguments above are set.\n' : ''}    ${g}const initData = Implementation.interface.encodeFunctionData("initialize", [${argList}]);

    ${g}const Proxy = await ethers.getContractFactory("${proxy.contractName}");
    ${g}const proxy = await Proxy.deploy(${proxyArgs});
    ${g}await proxy.waitForDeployment();

    // Interact with the proxy through the implementation's ABI.
    ${g}const instance = await ethers.getContractAt("${c.name}", await proxy.getAddress());
${assertion ? assertion + '\n' : ''}  });
});
`;
  }

  override async zipHardhat(c: Contract, opts?: GenericOptions): Promise<JSZip> {
    const zip = new JSZip();

    const packageJson = await this.getPackageJson(c);

    zip.file(`contracts/${c.name}.sol`, this.getPrintContract(c));
    if (c.upgradeable) {
      // Pull the proxy into the build so the deploy script can load its artifact.
      zip.file('contracts/Proxy.sol', tronProxyHelperSource(c, TRON_SOLIDITY_VERSION));
    }
    zip.file('test/test.ts', this.getTest(c, opts));
    // No hardhat-ignition: the TRON dev flow is a plain ethers deploy script,
    // matching the @openzeppelin/hardhat-tron README.
    zip.file('scripts/deploy.ts', this.getScript(c));

    zip.file('.gitignore', this.getGitIgnore());
    zip.file('hardhat.config.ts', this.getHardhatConfig(c.upgradeable));
    zip.file('package.json', JSON.stringify(packageJson, null, 2));
    // package-lock.json is intentionally omitted; see getPackageLock().
    zip.file('README.md', this.getReadme(c));
    zip.file('tsconfig.json', this.getTsConfig());

    return zip;
  }
}

export async function zipHardhatTron(c: Contract, opts?: GenericOptions): Promise<JSZip> {
  return new HardhatTronZipGenerator().zipHardhat(c, opts);
}
