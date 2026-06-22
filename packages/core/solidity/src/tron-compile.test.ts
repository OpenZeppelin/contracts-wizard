import { promises as fs } from 'fs';
import path from 'path';
import test from 'ava';
import type { ExecutionContext } from 'ava';
import hre from 'hardhat';

import { generateOptions } from './generate/sources';
import { buildGeneric } from './build-generic';
import type { KindedOptions } from './build-generic';
import { printContract } from './print';
import { OptionsError } from './error';
import { tronPrintProfile, sanitizeTronOptions } from './utils/transform-tron';

// Contract kinds offered on TRON. Account (ERC-4337 EntryPoint is out of scope) and
// Stablecoin / RealWorldAsset (depend on @openzeppelin/community-contracts, not ported
// to TRON) are intentionally excluded, mirroring the CLI / MCP / UI surfaces.
const TRON_KINDS = [
  'ERC20',
  'ERC721',
  'ERC1155',
  'Governor',
  'Custom',
] as const satisfies readonly (keyof KindedOptions)[];

// TRON analogue of `testCompile` in test.ts: generate every option combination for the
// TRON-eligible kinds, run each through the TRON sanitizer + print profile, and verify
// the result compiles against `@openzeppelin/tron-contracts`. This is the test that
// catches ERC->TRC mapping gaps (e.g. the Callback extension resolving to `ERC1363`
// instead of `TRC1363`) — something the content-snapshot tests structurally cannot do.
//
// SKIPPED until `@openzeppelin/tron-contracts` (and `@openzeppelin/tron-contracts-upgradeable`)
// are published to npm. To enable:
//   1. add both packages as devDependencies of this package;
//   2. compile these sources against the TRON library with tron-solc settings
//      (0.8.26 + cancun + viaIR) — e.g. a dedicated Hardhat config / compile target that
//      only picks up `generated-tron` and resolves `@openzeppelin/tron-contracts(-upgradeable)`;
//   3. remove `.skip` below.
for (const kind of TRON_KINDS) {
  test.skip(`tron ${kind} result compiles`, async t => {
    await testCompileTron(t, kind);
  });
}

async function testCompileTron(t: ExecutionContext, kind: keyof KindedOptions) {
  const generatedSourcesPath = path.join(hre.config.paths.sources, 'generated-tron');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await fs.mkdir(generatedSourcesPath, { recursive: true });

  let index = 0;
  for (const options of generateOptions(kind)) {
    // Mirror the TRON surfaces: drop options TRON doesn't support (e.g. `superchain`).
    const tronOptions = options.kind === 'ERC20' ? sanitizeTronOptions(options) : options;

    let source: string;
    try {
      source = printContract(buildGeneric(tronOptions), tronPrintProfile);
    } catch (e: unknown) {
      if (e instanceof OptionsError) {
        continue;
      }
      throw e;
    }

    await fs.writeFile(path.format({ dir: generatedSourcesPath, name: `${kind}_${index++}`, ext: '.sol' }), source);
  }

  // We only care that the contracts compile, not the artifacts. Empty outputSelection
  // keeps compilation fast and within memory (same trick as test.ts:testCompile).
  for (const { settings } of hre.config.solidity.compilers) {
    settings.outputSelection = {};
  }
  await hre.run('compile');

  t.pass();
}
