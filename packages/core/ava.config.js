module.exports = {
  extensions: ['ts'],
  require: ['ts-node/register'],
  ignoredByWatcher: [
    'contracts',
    'artifacts',
    'cache',
  ],
  timeout: '10m',
};
