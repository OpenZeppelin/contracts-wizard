import { promises as fs } from 'fs';
import path from 'path';

import { writeGeneratedSources } from '../generate/sources';
import { contractsVersion, edition, cairoVersion, scarbVersion } from '../utils/version';

export async function updateScarbProject() {
  const generatedSourcesPath = path.join('test_project', 'src');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });

  // Generate the contracts source code
  const contractNames = await writeGeneratedSources(generatedSourcesPath, 'all', true);

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
