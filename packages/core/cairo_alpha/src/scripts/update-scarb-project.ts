import { promises as fs } from 'fs';
import path from 'path';

import type { KindSubset } from '../generate/sources';
import { writeGeneratedSources } from '../generate/sources';
import { contractsVersion, edition, cairoVersion, scarbVersion } from '../utils/version';
import type { RoyaltyInfoSubset } from '../set-royalty-info';
import type { MacrosSubset } from '../set-macros';

type Arguments = {
  kind: KindSubset;
  royaltyInfo: RoyaltyInfoSubset;
  macros: MacrosSubset;
};

const defaults: Arguments = {
  kind: 'all',
  royaltyInfo: 'all',
  macros: 'all',
} as const;

export function resolveArguments(): Arguments {
  const cliArgs = process.argv.slice(2);
  const args = parseCliArgs(cliArgs);

  return {
    kind: parseKindSubset(args.kind ?? defaults.kind),
    royaltyInfo: parseRoyaltyInfoSubset(args['royalty-info'] ?? defaults.royaltyInfo),
    macros: parseMacrosSubset(args.macros ?? defaults.macros),
  };
}

function parseCliArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (arg.startsWith('--')) {
      const argName = arg.slice(2);
      if (argName.includes('=')) {
        // Handle --arg=value format
        const parts = argName.split('=', 2);
        const key = parts[0];
        const value = parts[1];
        if (key && value !== undefined) {
          result[key] = value;
        } else {
          throw new Error(`Invalid argument format: ${arg}`);
        }
      } else if (i + 1 < args.length) {
        // Handle --arg value format
        const nextArg = args[i + 1];
        if (nextArg && !nextArg.startsWith('--')) {
          result[argName] = nextArg;
          i++; // Skip the next argument since we've used it as a value
        } else {
          throw new Error(`No value provided for argument: ${arg}`);
        }
      } else {
        throw new Error(`No value provided for argument: ${arg}`);
      }
    } else {
      throw new Error(`Invalid argument format: ${arg}. Expected --key=value or --key value`);
    }
  }

  return result;
}

export async function updateScarbProject() {
  const generatedSourcesPath = path.join('test_project', 'src');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });

  // Generate the contracts source code
  const { kind, royaltyInfo, macros } = resolveArguments();
  const contractNames = await writeGeneratedSources({
    dir: generatedSourcesPath,
    subset: 'all',
    uniqueName: true,
    kind,
    royaltyInfo,
    macros,
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
  console.log('Updating Scarb.toml...');
  const scarbTomlPath = path.join('test_project', 'Scarb.toml');

  const currentContent = await fs.readFile(scarbTomlPath, 'utf8');

  // Update the version numbers from the version.ts file
  let updatedContent = currentContent
    .replace(/edition = "\w+"/, `edition = "${edition}"`)
    .replace(/cairo-version = "\d+\.\d+\.\d+"/, `cairo-version = "${cairoVersion}"`)
    .replace(/scarb-version = "\d+\.\d+\.\d+"/, `scarb-version = "${scarbVersion}"`)
    .replace(/starknet = "\d+\.\d+\.\d+"/, `starknet = "${cairoVersion}"`)
    .replace(/openzeppelin = "\d+\.\d+\.\d+"/, `openzeppelin = "${contractsVersion}"`);

  // In alphas, we add dependencies directly from the Github repo, and not from the registry.
  updatedContent = updatedContent.replace(/(openzeppelin = {[^}]*tag = )"[^"]+"/, `$1"v${contractsVersion}"`);

  await fs.writeFile(scarbTomlPath, updatedContent, 'utf8');
}

function parseKindSubset(value: string): KindSubset {
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

function parseRoyaltyInfoSubset(value: string): RoyaltyInfoSubset {
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

function parseMacrosSubset(value: string): MacrosSubset {
  switch (value.toLowerCase()) {
    case 'all':
      return 'all';
    case 'no':
    case 'none':
      return 'none';
    case 'with_components':
    case 'with-components':
      return 'with_components';
    default:
      throw new Error(`Failed to resolve macros subset from '${value}' value.`);
  }
}

updateScarbProject();
