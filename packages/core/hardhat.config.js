const { task } = require('hardhat/config');
const { HardhatError } = require('hardhat/internal/core/errors');
const { ERRORS } = require('hardhat/internal/core/errors-list');
const {
  TASK_COMPILE_SOLIDITY_CHECK_ERRORS,
  TASK_COMPILE_SOLIDITY_LOG_COMPILATION_ERRORS,
  TASK_COMPILE_SOLIDITY_MERGE_COMPILATION_JOBS,
} = require('hardhat/builtin-tasks/task-names');

require('array.prototype.flat/auto');

const WARN_UNUSED_PARAMETER = '5667';

// Overriding this task so that warnings are considered errors.
task(TASK_COMPILE_SOLIDITY_CHECK_ERRORS, async ({ output, quiet }, { run }) => {
  await run(TASK_COMPILE_SOLIDITY_LOG_COMPILATION_ERRORS, {
    output,
    quiet,
  });

  // Consider warnings as errors, except for unused parameter warnings, which
  // are caused by OpenZeppelin Upgradeable Contracts.
  if (output.errors && output.errors.some(e => e.errorCode !== WARN_UNUSED_PARAMETER)) {
    throw new HardhatError(ERRORS.BUILTIN_TASKS.COMPILE_FAILURE);
  }
});

task(TASK_COMPILE_SOLIDITY_MERGE_COMPILATION_JOBS, async ({ compilationJobs }, _, runSuper) => {
  const CHUNK_SIZE = 100;
  const chunks = [];
  for (let i = 0; i < compilationJobs.length - 1; i += CHUNK_SIZE) {
    chunks.push(compilationJobs.slice(i, i + CHUNK_SIZE));
  }
  const mergedChunks = await Promise.all(chunks.map(cj => runSuper({ compilationJobs: cj })));
  return mergedChunks.flat();
});


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.2',
};
