import { promises as fs } from 'fs';
import path from 'path';
import hre from 'hardhat';
import type { BuildInfo } from 'hardhat/types';
import type { SourceUnit } from 'solidity-ast';
import { findAll } from 'solidity-ast/utils';
import _rimraf from 'rimraf';
import { promisify } from 'util';
import { version } from "@openzeppelin/contracts/package.json";

const rimraf = promisify(_rimraf);

import type { OpenZeppelinContracts } from '../../openzeppelin-contracts';
import { writeGeneratedSources } from '../generate/sources';
import { mapValues } from '../utils/map-values';
import { transitiveClosure } from '../utils/transitive-closure';

async function main() {
  const generatedSourcesPath = path.join(hre.config.paths.sources, 'generated');
  await rimraf(generatedSourcesPath);
  await writeGeneratedSources(generatedSourcesPath, 'minimal-cover');
  await hre.run('compile');

  const dependencies: Record<string, Set<string>> = {};
  const sources: Record<string, string> = {};

  for (const buildInfoPath of await hre.artifacts.getBuildInfoPaths()) {
    const buildInfo: BuildInfo = JSON.parse(
      await fs.readFile(buildInfoPath, 'utf8'),
    );

    for (const [sourceFile, { ast }] of Object.entries(buildInfo.output.sources)) {
      if (sourceFile.startsWith('@openzeppelin/contracts')) {
        const sourceDependencies = (dependencies[sourceFile] ??= new Set());
        for (const imp of findAll('ImportDirective', ast)) {
          sourceDependencies.add(imp.absolutePath);
        }
      }
    }

    for (const [sourceFile, { content }] of Object.entries(buildInfo.input.sources)) {
      if (sourceFile.startsWith('@openzeppelin/contracts')) {
        sources[sourceFile] = content;
      }
    }
  }

  const contracts: OpenZeppelinContracts = {
    version,
    sources,
    dependencies: mapValues(transitiveClosure(dependencies), d => Array.from(d)),
  };

  await fs.writeFile('openzeppelin-contracts.json', JSON.stringify(contracts, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
