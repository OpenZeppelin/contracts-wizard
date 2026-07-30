import type { GenericOptions } from './build-generic';
import type { Contract, FunctionArgument } from './contract';
import type { Lines } from './utils/format-lines';
import { formatLinesWithSpaces, spaceBetween } from './utils/format-lines';
import { Hardhat3ZipGenerator } from './zip-hardhat';
import SOLIDITY_VERSION from './solidity-version.json';
import type JSZip from 'jszip';

/**
 * Generates the `test/test.ts` file for a Hardhat 3 + viem project, using AVA as the test runner.
 *
 * Uses `connection.viem` from `@nomicfoundation/hardhat-viem` for non-upgradeable deploys, and
 * `@openzeppelin/hardhat-upgrades/viem` for upgradeable proxies.
 */
class Hardhat3ViemTestGenerator {
  constructor(private parent: Hardhat3ViemZipGenerator) {}

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
      imports.push('import { upgrades } from "@openzeppelin/hardhat-upgrades/viem";');
    }
    return imports;
  }

  private getConnectionSetup(c: Contract): Lines[] {
    const lines = ['const connection = await hre.network.create();', 'const { viem } = connection;'];
    if (c.upgradeable) {
      lines.push('const upgradesApi = await upgrades(hre, connection);');
    }
    return lines;
  }

  private getTestCase(c: Contract, opts?: GenericOptions): Lines[] {
    const argNames = c.constructorArgs.map(a => a.name);
    return [
      `test("${c.name}", async t => {`,
      spaceBetween(this.declareVariables(c.constructorArgs), this.getDeployLines(c, argNames), this.getAssertions(c, opts)),
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
    return expects.length > 0 ? expects : ['t.truthy(instance.address);'];
  }

  private getExpects(opts?: GenericOptions): Lines[] {
    if (opts !== undefined) {
      switch (opts.kind) {
        case 'ERC20':
        case 'ERC721':
          return [`t.is(await instance.read.name(), ${JSON.stringify(opts.name)});`];
        case 'ERC1155':
          return [`t.is(await instance.read.uri([0n]), ${JSON.stringify(opts.uri)});`];
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
        return [`const ${arg.name} = (await viem.getWalletClients())[${i}].account.address;`];
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
      ];
    } else {
      return [`const instance = await ${this.parent.getDeploymentCall(c, argNames)};`];
    }
  }
}

/**
 * Generates a Hardhat 3 sample project that uses viem instead of ethers.
 *
 * Non-upgradeable projects use `@nomicfoundation/hardhat-viem` and Hardhat Ignition's viem
 * extension. Upgradeable projects use `@openzeppelin/hardhat-upgrades/viem`.
 */
export class Hardhat3ViemZipGenerator extends Hardhat3ZipGenerator {
  protected getHardhatConfig(upgradeable: boolean): string {
    const { imports, plugins } = upgradeable
      ? {
          imports:
            'import hardhatViem from "@nomicfoundation/hardhat-viem";\n' +
            'import hardhatUpgrades from "@openzeppelin/hardhat-upgrades/viem";',
          plugins: '[hardhatViem, hardhatUpgrades]',
        }
      : {
          imports:
            'import hardhatViem from "@nomicfoundation/hardhat-viem";\n' +
            'import hardhatIgnitionViem from "@nomicfoundation/hardhat-ignition-viem";',
          plugins: '[hardhatViem, hardhatIgnitionViem]',
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
    return new Hardhat3ViemTestGenerator(this).getContent(c, opts);
  }

  public getDeploymentCall(c: Contract, args: string[]): string {
    // TODO: remove that selector when the upgrades plugin supports @custom:oz-upgrades-unsafe-allow-reachable
    const unsafeAllowConstructor = c.parents.find(p => ['EIP712'].includes(p.contract.name)) !== undefined;
    const argsList = args.join(', ');

    if (!c.upgradeable) {
      return args.length === 0
        ? `viem.deployContract("${c.name}")`
        : `viem.deployContract("${c.name}", [${argsList}])`;
    }

    return unsafeAllowConstructor
      ? `upgradesApi.deployProxy("${c.name}", [${argsList}], { unsafeAllow: ['constructor'] })`
      : `upgradesApi.deployProxy("${c.name}", [${argsList}])`;
  }

  protected getScript(c: Contract): string {
    // Deploy scripts are only generated for upgradeable contracts; non-upgradeable
    // projects use a Hardhat Ignition module instead (see zipHardhat).
    if (!c.upgradeable) throw new Error('Deploy script is only used for upgradeable contracts');

    return `\
import hre from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades/viem";

async function main() {
  const connection = await hre.network.create();
  const upgradesApi = await upgrades(hre, connection);

  ${c.constructorArgs.length > 0 ? '// TODO: Set values for the constructor arguments below' : ''}
  const instance = await ${this.getDeploymentCall(
    c,
    c.constructorArgs.map(a => a.name),
  )};

  console.log(\`Proxy deployed to \${instance.address}\`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;
  }

  protected async getPackageJson(c: Contract): Promise<unknown> {
    const { default: packageJson } = c.upgradeable
      ? await import('./environments/hardhat-viem/upgradeable/package.json')
      : await import('./environments/hardhat-viem/package.json');
    packageJson.license = c.license;
    return packageJson;
  }

  protected async getPackageLock(c: Contract): Promise<unknown> {
    const { default: packageLock } = c.upgradeable
      ? await import('./environments/hardhat-viem/upgradeable/package-lock.json')
      : await import('./environments/hardhat-viem/package-lock.json');
    packageLock.packages[''].license = c.license;
    return packageLock;
  }
}

export async function zipHardhatViem(c: Contract, opts?: GenericOptions): Promise<JSZip> {
  return new Hardhat3ViemZipGenerator().zipHardhat(c, opts);
}
