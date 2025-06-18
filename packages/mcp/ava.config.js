module.exports = {
  extensions: ['ts'],
  require: ['ts-node/register'],
  timeout: '10m',
  workerThreads: false,
  files: ['src/**/*.test.ts', '!src/helpers.test.ts'],
};
