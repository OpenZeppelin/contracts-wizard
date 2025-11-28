import type JSZip from 'jszip';
import type { Contract } from '@openzeppelin/wizard';
import { HardhatZipGenerator } from '@openzeppelin/wizard/zip-env-hardhat';
import { printContract } from './print';

class ConfidentialHardhatZipGenerator extends HardhatZipGenerator {
  protected getAdditionalHardhatImports(): string[] {
    return ['@fhevm/hardhat-plugin'];
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

  public getHardhatPlugins(c: Contract): string[] {
    return super.getHardhatPlugins(c).concat(['fhevm']);
  }
}

export async function zipHardhat(c: Contract): Promise<JSZip> {
  return new ConfidentialHardhatZipGenerator().zipHardhat(c);
}
