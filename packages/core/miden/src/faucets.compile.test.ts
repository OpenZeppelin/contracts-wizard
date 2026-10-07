import test from 'ava';

import {
  cargoTest,
  rustfmtCheck,
  sourcesToCompile,
  withTemporaryCrate,
  writeAllVariants,
  writeCrate,
} from './utils/compile-test';

// These tests need the Rust toolchain pinned by the Miden protocol repository (see `RUST_TOOLCHAIN`) and network
// access to fetch the protocol crates from crates.io. They run in the `compile` variant of the CI matrix.

test.serial('generated faucets compile and build against the Miden protocol crates', async t => {
  t.timeout(3_000_000);
  await withTemporaryCrate(async dir => {
    await writeCrate(dir, sourcesToCompile());
    await cargoTest(t, dir);
  });
});

test.serial('every generated variant is formatted like rustfmt', async t => {
  t.timeout(3_000_000);
  await withTemporaryCrate(async dir => {
    await writeCrate(dir, []);
    const files = await writeAllVariants(dir);
    await rustfmtCheck(t, dir, files);
  });
});
