import test from 'ava';

import { runRustCompilationTest } from './utils/compile-test';

import { buildStablecoin } from './stablecoin';

test.serial(
  'compilation basic stablecoin',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin burnable',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      burnable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin pausable',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      pausable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin burnable pausable',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      burnable: true,
      pausable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin preminted',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '1000',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin premint of 0',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '0',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin mintable',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      mintable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin ownable',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      access: 'ownable',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin roles',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      access: 'roles',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin allowlist',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      limitations: 'allowlist',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin blocklist',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      limitations: 'blocklist',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin explicit trait implementations',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      explicitImplementations: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin full - ownable, allowlist',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '2000',
      access: 'ownable',
      limitations: 'allowlist',
      burnable: true,
      mintable: true,
      pausable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin full - ownable, blocklist',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '2000',
      access: 'ownable',
      limitations: 'blocklist',
      burnable: true,
      mintable: true,
      pausable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin full - roles, allowlist',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '2000',
      access: 'roles',
      limitations: 'allowlist',
      burnable: true,
      mintable: true,
      pausable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation stablecoin full - roles, blocklist',
  runRustCompilationTest(
    buildStablecoin,
    {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '2000',
      access: 'roles',
      limitations: 'blocklist',
      burnable: true,
      mintable: true,
      pausable: true,
    },
    { snapshotResult: false },
  ),
);

const explicitStablecoinCases: Array<{ title: string; options: Parameters<typeof buildStablecoin>[0] }> = [
  {
    title: 'compilation stablecoin burnable explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      burnable: true,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin pausable explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      pausable: true,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin burnable pausable explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      burnable: true,
      pausable: true,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin preminted explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '1000',
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin premint of 0 explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '0',
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin mintable explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      mintable: true,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin ownable explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      access: 'ownable',
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin roles explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      access: 'roles',
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin allowlist explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      limitations: 'allowlist',
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin blocklist explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      limitations: 'blocklist',
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin full - ownable, allowlist explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '2000',
      access: 'ownable',
      limitations: 'allowlist',
      burnable: true,
      mintable: true,
      pausable: true,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin full - ownable, blocklist explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '2000',
      access: 'ownable',
      limitations: 'blocklist',
      burnable: true,
      mintable: true,
      pausable: true,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin full - roles, allowlist explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '2000',
      access: 'roles',
      limitations: 'allowlist',
      burnable: true,
      mintable: true,
      pausable: true,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation stablecoin full - roles, blocklist explicit trait implementations',
    options: {
      kind: 'Stablecoin',
      name: 'MyStablecoin',
      symbol: 'MST',
      premint: '2000',
      access: 'roles',
      limitations: 'blocklist',
      burnable: true,
      mintable: true,
      pausable: true,
      explicitImplementations: true,
    },
  },
];

for (const { title, options } of explicitStablecoinCases) {
  test.serial(title, runRustCompilationTest(buildStablecoin, options, { snapshotResult: false }));
}
