import test from 'ava';

import {
  cargoCheck,
  rustfmtCheck,
  sourcesToCompile,
  withTemporaryCrate,
  writeAllVariants,
  writeCrate,
} from './utils/compile-test';

// These tests need the Rust toolchain pinned by the Miden protocol repository (see `RUST_TOOLCHAIN`) and network
// access to fetch the protocol crates from GitHub. They run in the `compile` variant of the CI matrix.

test.serial('generated faucets compile against the pinned Miden protocol', async t => {
  t.timeout(3_000_000);
  await withTemporaryCrate(async dir => {
    await writeCrate(dir, sourcesToCompile());
    await cargoCheck(t, dir);
  });
});

test.serial('every generated variant is formatted like rustfmt', async t => {
  t.timeout(3_000_000);
  await withTemporaryCrate(async dir => {
    await writeCrate(dir, new Map());
    const files = await writeAllVariants(dir);
    await rustfmtCheck(t, dir, files);
  });
});
