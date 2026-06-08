import JSZip from 'jszip';
import type { GenericOptions } from './build-generic';
import type { Contract, FunctionArgument } from './contract';
import { printContract } from './print';
import SOLIDITY_VERSION from './solidity-version.json';
import type { Lines } from './utils/format-lines';
import { formatLinesWithSpaces, spaceBetween } from './utils/format-lines';

class TestGenerator {
  constructor(private parent: HardhatZipGenerator) {}

  getContent(c: Contract, opts?: GenericOptions): string {
    return formatLinesWithSpaces(2, ...spaceBetween(this.getImports(c), this.getTestCase(c, opts)));
  }

  private getTestCase(c: Contract, opts?: GenericOptions): Lines[] {
    return [
      `describe("${c.name}", function () {`,
      [
        'it("Test contract", async function () {',
        spaceBetween(
          [`const ContractFactory = await ethers.getContractFactory("${c.name}");`],
          this.declareVariables(c.constructorArgs),
          this.getDeployLines(
            c,
            c.constructorArgs.map(a => a.name),
          ),
          this.getExpects(opts),
        ),
        '});',
      ],
      '});',
    ];
  }

  private getImports(c: Contract): Lines[] {
    return [
      'import { expect } from "chai";',
      `import { ${this.parent.getHardhatPlugins(c).join(', ')} } from "hardhat";`,
    ];
  }

  private getExpects(opts?: GenericOptions): Lines[] {
    if (opts !== undefined) {
      switch (opts.kind) {
        case 'ERC20':
        case 'ERC721':
          return [`expect(await instance.name()).to.equal(${JSON.stringify(opts.name)});`];
        case 'ERC1155':
          return [`expect(await instance.uri(0)).to.equal(${JSON.stringify(opts.uri)});`];
        case 'Account':
        case 'Governor':
        case 'Custom':
          break;
        default:
          throw new Error('Unknown ERC');
      }
    }
    return [];
  }

  private declareVariables(args: FunctionArgument[]): Lines[] {
    return args.flatMap((arg, i) => {
      if (arg.type === 'address') {
        return [`const ${arg.name} = (await ethers.getSigners())[${i}].address;`];
      } else {
        return [`// TODO: Set the following constructor argument`, `// const ${arg.name} = ...;`];
      }
    });
  }

  private getDeployLines(c: Contract, argNames: string[]): Lines[] {
    if (c.constructorArgs.some(a => a.type !== 'address')) {
      return [
        `// TODO: Uncomment the below when the missing constructor arguments are set above`,
        `// const instance = await ${this.parent.getDeploymentCall(c, argNames)};`,
        `// await instance.waitForDeployment();`,
      ];
    } else {
      return [
        `const instance = await ${this.parent.getDeploymentCall(c, argNames)};`,
        'await instance.waitForDeployment();',
      ];
    }
  }
}

/**
 * Generates a Hardhat 2 sample project.
 *
 * This base class is retained for the Polkadot (`@parity/hardhat-polkadot`) and Confidential
 * (`@fhevm/hardhat-plugin`) variants, whose plugins still target Hardhat 2. The standard Solidity
 * download uses {@link Hardhat3ZipGenerator} instead (see {@link zipHardhat}).
 */
export class HardhatZipGenerator {
  protected getAdditionalHardhatImports(): string[] {
    return [];
  }

  protected getHardhatConfigJsonString(): string {
    return `\
{
  solidity: {
    version: "${SOLIDITY_VERSION}",
    settings: {
      evmVersion: 'cancun',
      optimizer: {
        enabled: true,
      },
    },
  },
}`;
  }

  protected getHardhatConfig(upgradeable: boolean): string {
    const additionalImports = this.getAdditionalHardhatImports();
    const importsSection =
      additionalImports.length > 0 ? additionalImports.map(imp => `import "${imp}";`).join('\n') + '\n' : '';

    return `\
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
${importsSection}${upgradeable ? `import "@openzeppelin/hardhat-upgrades";` : ''}

const config: HardhatUserConfig = ${this.getHardhatConfigJsonString()};

export default config;
`;
  }

  protected getTsConfig(): string {
    return `\
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
`;
  }

  protected getGitIgnoreHardhatIgnition(): string {
    return `
# Hardhat Ignition default folder for deployments against a local node
ignition/deployments/chain-31337
`;
  }

  protected getGitIgnore(): string {
    return `\
node_modules
.env
coverage
coverage.json
typechain
typechain-types

# Hardhat files
cache
artifacts
${this.getGitIgnoreHardhatIgnition()}`;
  }

  protected getTest(c: Contract, opts?: GenericOptions): string {
    return new TestGenerator(this).getContent(c, opts);
  }

  public getDeploymentCall(c: Contract, args: string[]): string {
    // TODO: remove that selector when the upgrades plugin supports @custom:oz-upgrades-unsafe-allow-reachable
    const unsafeAllowConstructor = c.parents.find(p => ['EIP712'].includes(p.contract.name)) !== undefined;

    return !c.upgradeable
      ? `ContractFactory.deploy(${args.join(', ')})`
      : unsafeAllowConstructor
        ? `upgrades.deployProxy(ContractFactory, [${args.join(', ')}], { unsafeAllow: ['constructor'] })`
        : `upgrades.deployProxy(ContractFactory, [${args.join(', ')}])`;
  }

  protected getScript(c: Contract): string {
    return `\
import { ${this.getHardhatPlugins(c).join(', ')} } from "hardhat";

async function main() {
  const ContractFactory = await ethers.getContractFactory("${c.name}");

  ${c.constructorArgs.length > 0 ? '// TODO: Set values for the constructor arguments below' : ''}
  const instance = await ${this.getDeploymentCall(
    c,
    c.constructorArgs.map(a => a.name),
  )};
  await instance.waitForDeployment();

  console.log(\`${c.upgradeable ? 'Proxy' : 'Contract'} deployed to \${await instance.getAddress()}\`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;
  }

  private lowerFirstCharacter(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  protected getIgnitionModule(c: Contract): string {
    const contractVariableName = this.lowerFirstCharacter(c.name);
    return `import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("${c.name}Module", (m) => {

  ${c.constructorArgs.length > 0 ? '// TODO: Set values for the constructor arguments below' : ''}
  const ${contractVariableName} = m.contract("${c.name}", [${c.constructorArgs.map(a => a.name).join(', ')}]);

  return { ${contractVariableName} };
});
`;
  }

  protected getReadmeTestingEnvironmentSetupSection(): string {
    return '';
  }

  protected getReadmePrerequisitesSection(): string {
    return '';
  }

  protected getReadme(c: Contract): string {
    return `\
# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a contract generated by [OpenZeppelin Wizard](https://wizard.openzeppelin.com/), a test for that contract, ${c.upgradeable ? 'and a script that deploys that contract' : 'and a Hardhat Ignition module that deploys that contract'}.

${this.getReadmePrerequisitesSection()}## Installing dependencies

\`\`\`
npm install
\`\`\`

${this.getReadmeTestingEnvironmentSetupSection()}## Testing the contract

\`\`\`
npm test
\`\`\`

## Deploying the contract

You can target any network from your Hardhat config using:

\`\`\`
${c.upgradeable ? 'npx hardhat run --network <network-name> scripts/deploy.ts' : `npx hardhat ignition deploy ignition/modules/${c.name}.ts --network <network-name>`}
\`\`\`
`;
  }

  public getHardhatPlugins(c: Contract): string[] {
    const plugins = ['ethers'];
    if (c.upgradeable) {
      plugins.push('upgrades');
    }
    return plugins;
  }

  protected async getPackageJson(c: Contract): Promise<unknown> {
    const { default: packageJson } = c.upgradeable
      ? await import('./environments/hardhat/upgradeable/package.json')
      : await import('./environments/hardhat/package.json');
    packageJson.license = c.license;
    return packageJson;
  }

  protected async getPackageLock(c: Contract): Promise<unknown> {
    const { default: packageLock } = c.upgradeable
      ? await import('./environments/hardhat/upgradeable/package-lock.json')
      : await import('./environments/hardhat/package-lock.json');
    packageLock.packages[''].license = c.license;
    return packageLock;
  }

  protected getPrintContract(c: Contract): string {
    return printContract(c);
  }

  async zipHardhat(c: Contract, opts?: GenericOptions): Promise<JSZip> {
    const zip = new JSZip();

    const packageJson = await this.getPackageJson(c);
    const packageLock = await this.getPackageLock(c);

    zip.file(`contracts/${c.name}.sol`, this.getPrintContract(c));
    zip.file('test/test.ts', this.getTest(c, opts));

    if (c.upgradeable) {
      zip.file('scripts/deploy.ts', this.getScript(c));
    } else {
      zip.file(`ignition/modules/${c.name}.ts`, this.getIgnitionModule(c));
    }

    zip.file('.gitignore', this.getGitIgnore());
    zip.file('hardhat.config.ts', this.getHardhatConfig(c.upgradeable));
    zip.file('package.json', JSON.stringify(packageJson, null, 2));
    zip.file(`package-lock.json`, JSON.stringify(packageLock, null, 2));
    zip.file('README.md', this.getReadme(c));
    zip.file('tsconfig.json', this.getTsConfig());

    return zip;
  }
}

/**
 * Generates the `test/test.ts` file for a Hardhat 3 project, using AVA as the test runner.
 *
 * Unlike Hardhat 2 (where `ethers` and `upgrades` are imported directly from `"hardhat"`), Hardhat 3
 * exposes them through a network connection: `ethers` comes from `hre.network.create()` and the
 * upgrades API is obtained via `upgrades(hre, connection)`.
 */
class Hardhat3TestGenerator {
  constructor(private parent: Hardhat3ZipGenerator) {}

  getContent(c: Contract, opts?: GenericOptions): string {
    return formatLinesWithSpaces(
      2,
      ...spaceBetween(
        this.getImports(c),
        this.getConnectionSetup(c),
        ['test.after.always(() => connection.close());'],
        this.getTestCase(c, opts),
      ),
    );
  }

  private getImports(c: Contract): Lines[] {
    const imports = ['import test from "ava";', 'import hre from "hardhat";'];
    if (c.upgradeable) {
      imports.push('import { upgrades } from "@openzeppelin/hardhat-upgrades";');
    }
    return imports;
  }

  private getConnectionSetup(c: Contract): Lines[] {
    const lines = ['const connection = await hre.network.create();', 'const { ethers } = connection as any;'];
    if (c.upgradeable) {
      lines.push('const upgradesApi = await upgrades(hre, connection);');
    }
    return lines;
  }

  private getTestCase(c: Contract, opts?: GenericOptions): Lines[] {
    const argNames = c.constructorArgs.map(a => a.name);
    return [
      `test("${c.name}", async t => {`,
      spaceBetween(
        [`const ContractFactory = await ethers.getContractFactory("${c.name}");`],
        this.declareVariables(c.constructorArgs),
        this.getDeployLines(c, argNames),
        this.getAssertions(c, opts),
      ),
      '});',
    ];
  }

  private getAssertions(c: Contract, opts?: GenericOptions): Lines[] {
    if (c.constructorArgs.some(a => a.type !== 'address')) {
      // The deployment is commented out until the user fills in the missing constructor arguments,
      // so there is no `instance` to assert against yet. `t.pass()` keeps AVA happy in the meantime.
      return ['t.pass();'];
    }
    const expects = this.getExpects(opts);
    // AVA fails a test that runs no assertions, so fall back to a deployment sanity check.
    return expects.length > 0 ? expects : ['t.truthy(await instance.getAddress());'];
  }

  private getExpects(opts?: GenericOptions): Lines[] {
    if (opts !== undefined) {
      switch (opts.kind) {
        case 'ERC20':
        case 'ERC721':
          return [`t.is(await instance.name(), ${JSON.stringify(opts.name)});`];
        case 'ERC1155':
          return [`t.is(await instance.uri(0), ${JSON.stringify(opts.uri)});`];
        case 'Account':
        case 'Governor':
        case 'Custom':
          break;
        default:
          throw new Error('Unknown ERC');
      }
    }
    return [];
  }

  private declareVariables(args: FunctionArgument[]): Lines[] {
    return args.flatMap((arg, i) => {
      if (arg.type === 'address') {
        return [`const ${arg.name} = (await ethers.getSigners())[${i}].address;`];
      } else {
        return [`// TODO: Set the following constructor argument`, `// const ${arg.name} = ...;`];
      }
    });
  }

  private getDeployLines(c: Contract, argNames: string[]): Lines[] {
    if (c.constructorArgs.some(a => a.type !== 'address')) {
      return [
        `// TODO: Uncomment the below when the missing constructor arguments are set above`,
        `// const instance = await ${this.parent.getDeploymentCall(c, argNames)};`,
        `// await instance.waitForDeployment();`,
      ];
    } else {
      return [
        `const instance = await ${this.parent.getDeploymentCall(c, argNames)};`,
        'await instance.waitForDeployment();',
      ];
    }
  }
}

/**
 * Generates a Hardhat 3 sample project. Used for the standard Solidity download (see {@link zipHardhat}).
 *
 * Differs from the Hardhat 2 base class in that it uses `defineConfig` with an explicit `plugins` array,
 * AVA + tsx as the (ESM) test runner, and the `hre.network.create()` connection pattern. Upgradeable
 * projects use `@openzeppelin/hardhat-upgrades` v4 (which targets Hardhat 3).
 */
export class Hardhat3ZipGenerator extends HardhatZipGenerator {
  protected getHardhatConfig(upgradeable: boolean): string {
    const { imports, plugins } = upgradeable
      ? {
          imports: 'import hardhatUpgrades from "@openzeppelin/hardhat-upgrades";',
          plugins: '[hardhatUpgrades]',
        }
      : {
          imports:
            'import hardhatEthers from "@nomicfoundation/hardhat-ethers";\n' +
            'import hardhatIgnitionEthers from "@nomicfoundation/hardhat-ignition-ethers";',
          plugins: '[hardhatEthers, hardhatIgnitionEthers]',
        };

    return `\
import { defineConfig } from "hardhat/config";
${imports}

export default defineConfig({
  plugins: ${plugins},
  solidity: {
    version: "${SOLIDITY_VERSION}",
    settings: {
      evmVersion: 'cancun',
      optimizer: {
        enabled: true,
      },
    },
  },
});
`;
  }

  protected getTest(c: Contract, opts?: GenericOptions): string {
    return new Hardhat3TestGenerator(this).getContent(c, opts);
  }

  public getDeploymentCall(c: Contract, args: string[]): string {
    // TODO: remove that selector when the upgrades plugin supports @custom:oz-upgrades-unsafe-allow-reachable
    const unsafeAllowConstructor = c.parents.find(p => ['EIP712'].includes(p.contract.name)) !== undefined;

    return !c.upgradeable
      ? `ContractFactory.deploy(${args.join(', ')})`
      : unsafeAllowConstructor
        ? `upgradesApi.deployProxy(ContractFactory, [${args.join(', ')}], { unsafeAllow: ['constructor'] })`
        : `upgradesApi.deployProxy(ContractFactory, [${args.join(', ')}])`;
  }

  protected getScript(c: Contract): string {
    return `\
import hre from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";

async function main() {
  const connection = await hre.network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);

  const ContractFactory = await ethers.getContractFactory("${c.name}");

  ${c.constructorArgs.length > 0 ? '// TODO: Set values for the constructor arguments below' : ''}
  const instance = await ${this.getDeploymentCall(
    c,
    c.constructorArgs.map(a => a.name),
  )};
  await instance.waitForDeployment();

  console.log(\`Proxy deployed to \${await instance.getAddress()}\`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;
  }

  protected getTsConfig(): string {
    return `\
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "Node16",
    "lib": ["es2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node16",
    "noEmit": true
  },
  "include": ["./scripts", "./test", "./ignition", "./hardhat.config.ts"],
  "exclude": ["node_modules"]
}
`;
  }

  protected getReadmePrerequisitesSection(): string {
    return `\
## Prerequisites

This project uses [Hardhat 3](https://hardhat.org/), which requires [Node.js](https://nodejs.org/) v22 or later.

`;
  }

  protected getAvaConfig(): string {
    return `\
export default {
  files: ['test/**/*.ts'],
  extensions: { ts: 'module' },
  nodeArguments: ['--import', 'tsx'],
  timeout: '60s',
};
`;
  }

  async zipHardhat(c: Contract, opts?: GenericOptions): Promise<JSZip> {
    const zip = await super.zipHardhat(c, opts);
    zip.file('ava.config.js', this.getAvaConfig());
    return zip;
  }
}

export async function zipHardhat(c: Contract, opts?: GenericOptions): Promise<JSZip> {
  return new Hardhat3ZipGenerator().zipHardhat(c, opts);
}
