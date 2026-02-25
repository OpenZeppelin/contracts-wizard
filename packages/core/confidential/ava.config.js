module.exports = {
  extensions: ['ts'],
  require: ['ts-node/register'],
  watchmode: {
    ignoreChanges: ['contracts', 'artifacts', 'cache'],
  },
  timeout: '10m',
  workerThreads: false,
};
