const { task } = require('hardhat/config');
const { HardhatError } = require('hardhat/internal/core/errors');
const { ERRORS } = require('hardhat/internal/core/errors-list');
const {
  TASK_COMPILE_SOLIDITY_CHECK_ERRORS,
  TASK_COMPILE_SOLIDITY_LOG_COMPILATION_ERRORS,
  TASK_COMPILE_SOLIDITY_MERGE_COMPILATION_JOBS,
} = require('hardhat/builtin-tasks/task-names');

require('array.prototype.flat/auto');

// Unused parameter warnings are caused by OpenZeppelin Upgradeable Contracts.
const WARN_UNUSED_PARAMETER = '5667';
const WARN_CODE_SIZE = '5574';
const IGNORED_WARNINGS = [WARN_UNUSED_PARAMETER, WARN_CODE_SIZE];

// Overriding this task so that warnings are considered errors.
task(TASK_COMPILE_SOLIDITY_CHECK_ERRORS, async ({ output, quiet }, { run }) => {
  const errors = output.errors && output.errors.filter(e => !IGNORED_WARNINGS.includes(e.errorCode)) || [];

  await run(TASK_COMPILE_SOLIDITY_LOG_COMPILATION_ERRORS, {
    output: { ...output, errors },
    quiet,
  });

  if (errors.length > 0) {
    throw new HardhatError(ERRORS.BUILTIN_TASKS.COMPILE_FAILURE);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.4',
};
