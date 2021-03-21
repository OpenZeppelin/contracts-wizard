const { task } = require('hardhat/config');
const { HardhatError } = require('hardhat/internal/core/errors');
const { ERRORS } = require('hardhat/internal/core/errors-list');
const {
  TASK_COMPILE_SOLIDITY_CHECK_ERRORS,
  TASK_COMPILE_SOLIDITY_LOG_COMPILATION_ERRORS,
} = require('hardhat/builtin-tasks/task-names');

// Overriding this task so that warnings are considered errors.
task(TASK_COMPILE_SOLIDITY_CHECK_ERRORS, async ({ output, quiet }, { run }) => {
  await run(TASK_COMPILE_SOLIDITY_LOG_COMPILATION_ERRORS, {
    output,
    quiet,
  });

  if (output.errors?.length) {
    throw new HardhatError(ERRORS.BUILTIN_TASKS.COMPILE_FAILURE);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.0',
};
