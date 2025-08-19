import { promises as fs } from 'fs';
import path from 'path';

import type { KindSubset } from '../generate/sources';
import { writeGeneratedSources } from '../generate/sources';
import { contractsVersion, edition, cairoVersion, scarbVersion } from '../utils/version';
import type { RoyaltyInfoSubset } from '../set-royalty-info';

type Arguments = {
  kind: KindSubset;
  royaltyInfo: RoyaltyInfoSubset;
};

export function resolveArguments(): Arguments {
  const cliArgs = process.argv.slice(2);
  switch (cliArgs.length) {
    case 0:
      return { kind: 'all', royaltyInfo: 'all' };
    case 1:
      return {
        kind: parseKindSubset(cliArgs[0]),
        royaltyInfo: 'all',
      };
    case 2:
      return {
        kind: parseKindSubset(cliArgs[0]),
        royaltyInfo: parseRoyaltyInfoSubset(cliArgs[1]),
      };
    default:
      throw new Error(`Too many CLI arguments provided: ${cliArgs.length}.`);
  }
}

export async function updateScarbProject() {
  const generatedSourcesPath = path.join('test_project', 'src');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });

  // Generate the contracts source code
  const { kind, royaltyInfo } = resolveArguments();
  const contractNames = await writeGeneratedSources({
    dir: generatedSourcesPath,
    subset: 'all',
    uniqueName: true,
    kind,
    royaltyInfo,
    logsEnabled: true,
  });

  // Generate lib.cairo file
  await writeLibCairo(contractNames);

  // Update Scarb.toml
  await updateScarbToml();
}

async function writeLibCairo(contractNames: string[]) {
  const libCairoPath = path.join('test_project/src', 'lib.cairo');
  const libCairo = contractNames.map(name => `pub mod ${name};\n`).join('');
  await fs.writeFile(libCairoPath, libCairo);
}

async function updateScarbToml() {
  const scarbTomlPath = path.join('test_project', 'Scarb.toml');

  const currentContent = await fs.readFile(scarbTomlPath, 'utf8');
  const updatedContent = currentContent
    .replace(/edition = "\w+"/, `edition = "${edition}"`)
    .replace(/cairo-version = "\d+\.\d+\.\d+"/, `cairo-version = "${cairoVersion}"`)
    .replace(/scarb-version = "\d+\.\d+\.\d+"/, `scarb-version = "${scarbVersion}"`)
    .replace(/starknet = "\d+\.\d+\.\d+"/, `starknet = "${cairoVersion}"`)
    .replace(/openzeppelin = "\d+\.\d+\.\d+"/, `openzeppelin = "${contractsVersion}"`);

  await fs.writeFile(scarbTomlPath, updatedContent, 'utf8');
}

function parseKindSubset(value: string | undefined): KindSubset {
  if (value === undefined) {
    throw new Error(`Failed to resolve contract kind subset from 'undefined'.`);
  }
  switch (value.toLowerCase()) {
    case 'all':
      return 'all';
    case 'erc20':
      return 'ERC20';
    case 'erc721':
      return 'ERC721';
    case 'erc1155':
      return 'ERC1155';
    case 'account':
      return 'Account';
    case 'multisig':
      return 'Multisig';
    case 'governor':
      return 'Governor';
    case 'vesting':
      return 'Vesting';
    case 'custom':
      return 'Custom';
    default:
      throw new Error(`Failed to resolve contract kind subset from '${value}'.`);
  }
}

function parseRoyaltyInfoSubset(value: string | undefined): RoyaltyInfoSubset {
  if (value === undefined) {
    throw new Error(`Failed to resolve royalty info subset from 'undefined'.`);
  }
  switch (value.toLowerCase()) {
    case 'all':
      return 'all';
    case 'disabled':
      return 'disabled';
    case 'enabled_default':
      return 'enabled_default';
    case 'enabled_custom':
      return 'enabled_custom';
    default:
      throw new Error(`Failed to resolve royalty info subset from '${value}' value.`);
  }
}

updateScarbProject();
