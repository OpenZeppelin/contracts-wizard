import JSZip from "jszip";
import type { Contract } from "../contract";
import { printContract } from "../print";

const hardhatConfig = `
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};

export default config;
`;

const packageJson = (variant: string) => `\
{
  "name": "hardhat-ts",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "npx hardhat test"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^2.0.0",
    "@openzeppelin/contracts${variant}": "^4.7.3",
    "hardhat": "^2.11.2"
  }
}
`

const tsConfig = `\
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
`

const gitIgnore = `\
node_modules
.env
coverage
coverage.json
typechain
typechain-types

#Hardhat files
cache
artifacts
`

const test = (name: string) => `\
import { expect } from "chai";
import { ethers } from "hardhat";

describe("${name}", function () {
  it("Should return token name", async function () {
    const ContractFactory = await ethers.getContractFactory("${name}");

    const instance = await ContractFactory.deploy();
    await instance.deployed();

    expect(await instance.name()).to.equal("${name}");
  });
});
`

const script = (name: string) => `\
import { ethers } from "hardhat";

async function main() {
  const ContractFactory = await ethers.getContractFactory("${name}");

  const instance = await ContractFactory.deploy();
  await instance.deployed();

  console.log(\`Contract deployed to \${instance.address}\`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`

export function zipHardhat(c: Contract) {
  const zip = new JSZip();

  const contractsVariant = c.upgradeable ? '-upgradeable' : '';

  zip.file('hardhat.config.ts', hardhatConfig);
  zip.file('package.json', packageJson(contractsVariant));
  //zip.file('README.md', readme); TODO
  zip.file('tsconfig.json', tsConfig);
  zip.file('.gitignore', gitIgnore);
  zip.file('test/test.ts', test(c.name));
  zip.file('scripts/deploy.ts', script(c.name));

  zip.file(`contracts/${c.name}.sol`, printContract(c));

  return zip;
}