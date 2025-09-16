import type JSZip from 'jszip';
import type { Contract, Lines } from '@openzeppelin/wizard';
import { HardhatZipGenerator } from '@openzeppelin/wizard';
import { printContract } from './print';

class ConfidentialHardhatZipGenerator extends HardhatZipGenerator {
  protected getAdditionalHardhatImports(): string[] {
    return ['@fhevm/hardhat-plugin'];
  }

  protected getHardhatPlugins(_: Contract): string[] {
    // Confidential contracts only use ethers, no upgrades support
    return ['ethers'];
  }

  protected getDeploymentCall(_: Contract, args: string[]): string {
    // Confidential contracts don't support upgradeable
    return `ContractFactory.deploy(${args.join(', ')})`;
  }

  protected getExpects(): Lines[] {
    // Confidential contracts don't use the generic options expectations
    return [];
  }

  protected async getPackageJson(c: Contract): Promise<unknown> {
    const { default: packageJson } = await import('./environments/hardhat/package.json');
    packageJson.license = c.license;
    return packageJson;
  }

  protected async getPackageLock(c: Contract): Promise<unknown> {
    const { default: packageLock } = await import('./environments/hardhat/package-lock.json');
    packageLock.packages[''].license = c.license;
    return packageLock;
  }

  protected getPrintContract(c: Contract): string {
    return printContract(c);
  }
}

// Create confidential-specific instance
const confidentialGenerator = new ConfidentialHardhatZipGenerator();

export async function zipHardhat(c: Contract): Promise<JSZip> {
  return confidentialGenerator.zipHardhat(c);
}
