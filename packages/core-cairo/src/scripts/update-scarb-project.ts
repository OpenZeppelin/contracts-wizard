import { promises as fs } from 'fs';
import path from 'path';

import { writeGeneratedSources } from '../generate/sources';

export async function updateScarbProject() {
  const generatedSourcesPath = path.join('test_project', `src`);
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });

  // Generate the contracts source code
  const contractNames = await writeGeneratedSources(generatedSourcesPath, 'all', true);

  // Generate lib.cairo file
  writeLibCairo(contractNames);
}

async function writeLibCairo(contractNames: string[]) {
  const libCairoPath = path.join('test_project/src', `lib.cairo`);
  const libCairo = contractNames.map(name => `pub mod ${name};\n`).join('');
  await fs.writeFile(libCairoPath, libCairo);
}


updateScarbProject();
