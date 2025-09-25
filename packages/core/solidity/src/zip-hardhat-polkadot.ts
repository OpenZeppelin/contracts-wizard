import type JSZip from 'jszip';
import type { Contract } from './contract';
import { HardhatZipGenerator } from './zip-hardhat';
import type { GenericOptions } from './build-generic';
import SOLIDITY_VERSION from './solidity-version.json';

class HardhatPolkadotZipGenerator extends HardhatZipGenerator {
  protected getAdditionalHardhatImports(): string[] {
    return ['@parity/hardhat-polkadot'];
  }

  protected getHardhatConfigJsonString(): string {
    return `\
{
  solidity: '${SOLIDITY_VERSION}',
  resolc: {
    compilerSource: 'npm',
  },
  networks: {
    hardhat: {
      polkavm: true,
      nodeConfig: {
        nodeBinaryPath: 'INSERT_PATH_TO_SUBSTRATE_NODE',
        rpcPort: 8000,
        dev: true,
      },
      adapterConfig: {
        adapterBinaryPath: 'INSERT_PATH_TO_ETH_RPC_ADAPTER',
        dev: true,
      },
    },
  },
}`;
  }

  protected async getPackageJson(c: Contract): Promise<unknown> {
    const { default: packageJson } = await import('./environments/hardhat/polkadot/package.json');
    packageJson.license = c.license;
    return packageJson;
  }

  protected async getPackageLock(c: Contract): Promise<unknown> {
    const { default: packageLock } = await import('./environments/hardhat/polkadot/package-lock.json');
    packageLock.packages[''].license = c.license;
    return packageLock;
  }

  protected getReadmeTestingEnvironmentSetupSection(): string {
    return `\
## Setting up a testing environment

Follow the steps in [Polkadot's documentation](https://docs.polkadot.com/develop/smart-contracts/dev-environments/hardhat/#set-up-a-testing-environment) to set up a local development node and replace the placeholder values \`INSERT_PATH_TO_SUBSTRATE_NODE\` and \`INSERT_PATH_TO_ETH_RPC_ADAPTER\` in \`hardhat.config.ts\`.

`;
  }

  protected getGitIgnoreHardhatIgnition(): string {
    return `
# Hardhat Ignition default folder for deployments against a local Polkadot Revive Dev node
ignition/deployments/chain-420420420
    `;
  }
}

export async function zipHardhatPolkadot(c: Contract, opts?: GenericOptions): Promise<JSZip> {
  return new HardhatPolkadotZipGenerator().zipHardhat(c, opts);
}
