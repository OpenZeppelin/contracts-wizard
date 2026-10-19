module.exports = {
  extensions: ['ts'],
  // API tests run separately under Deno.
  files: ['src/**/*.test.ts'],
  require: ['./ts-node-register.cjs'],
  timeout: '10m',
  workerThreads: false,
};
