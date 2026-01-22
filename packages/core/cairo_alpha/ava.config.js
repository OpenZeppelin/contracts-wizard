module.exports = {
  extensions: ['ts'],
  require: ['ts-node/register'],
  files: ['src/**/*.test.ts'],
  watchmode: {
    ignoreChanges: ['contracts', 'artifacts', 'cache'],
  },
  snapshotDir: '.',
  timeout: '10m',
  workerThreads: false,
};
