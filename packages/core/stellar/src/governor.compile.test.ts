import test from 'ava';

import { buildGovernor } from './governor';
import { runRustCompilationTest } from './utils/compile-test';

test.serial(
  'compilation governor default',
  runRustCompilationTest(
    buildGovernor,
    {
      kind: 'Governor',
      name: 'MyGovernor',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation governor custom settings',
  runRustCompilationTest(
    buildGovernor,
    {
      kind: 'Governor',
      name: 'DAOGovernor',
      version: '2.1.0',
      votingDelay: '10',
      votingPeriod: '5000',
      proposalThreshold: '100',
      quorum: '500',
    },
    { snapshotResult: false },
  ),
);
