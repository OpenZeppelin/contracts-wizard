import { promises as fs } from 'fs';
import path from 'path';

import { writeGeneratedSources } from '../generate/sources';
import { contractsVersion, edition, cairoVersion, scarbVersion } from '../utils/version';
import { Kind, parseKind } from '../kind';

type Arguments = {
  kind: Kind | undefined
};

export function resolveArguments(): Arguments {
  const cliArgs = process.argv.slice(2);
  switch (cliArgs.length) {
    case 0:
      return { kind: undefined };
    case 1:
      return { kind: parseKind(cliArgs[0]) };
    default:
      throw new Error(`Too many CLI arguments provided: ${cliArgs.length}.`)
  }
}

export async function updateScarbProject() {
  const args = resolveArguments();
  const generatedSourcesPath = path.join('test_project', 'src');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });

  // Generate the contracts source code
  const contractNames = await writeGeneratedSources(generatedSourcesPath, 'all', true, args.kind);

  // Generate lib.cairo file
  writeLibCairo(contractNames);

  // Update Scarb.toml
  updateScarbToml();
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

updateScarbProject();
