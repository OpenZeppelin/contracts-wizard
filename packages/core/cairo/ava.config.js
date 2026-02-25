module.exports = {
  extensions: ['ts'],
  require: ['ts-node/register'],
  watchmode: {
    ignoreChanges: ['contracts', 'artifacts', 'cache'],
  },
  snapshotDir: '.',
  timeout: '10m',
  workerThreads: false,
};
