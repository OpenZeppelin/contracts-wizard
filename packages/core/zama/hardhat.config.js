const fs = require('fs');
const { task } = require('hardhat/config');
const { HardhatError } = require('hardhat/internal/core/errors');
const { ERRORS } = require('hardhat/internal/core/errors-list');
const {
  TASK_COMPILE_SOLIDITY_CHECK_ERRORS,
  TASK_COMPILE_SOLIDITY_LOG_COMPILATION_ERRORS,
  TASK_COMPILE_SOLIDITY_MERGE_COMPILATION_JOBS,
  TASK_COMPILE_GET_REMAPPINGS,
} = require('hardhat/builtin-tasks/task-names');
const SOLIDITY_VERSION = require('@openzeppelin/wizard/src/solidity-version.json');

// Unused parameter warnings are caused by OpenZeppelin Upgradeable Contracts.
const WARN_UNUSED_PARAMETER = '5667';
const WARN_CODE_SIZE = '5574';
const IGNORED_WARNINGS = [WARN_UNUSED_PARAMETER, WARN_CODE_SIZE];

// Overriding this task so that warnings are considered errors.
task(TASK_COMPILE_SOLIDITY_CHECK_ERRORS, async ({ output, quiet }, { run }) => {
  const errors = (output.errors && output.errors.filter(e => !IGNORED_WARNINGS.includes(e.errorCode))) || [];

  await run(TASK_COMPILE_SOLIDITY_LOG_COMPILATION_ERRORS, {
    output: { ...output, errors },
    quiet,
  });

  if (errors.length > 0) {
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

task(TASK_COMPILE_GET_REMAPPINGS).setAction((_, __, runSuper) =>
  runSuper().then(remappings =>
    Object.assign(
      remappings,
      Object.fromEntries(
        fs
          .readFileSync('remappings.txt', 'utf-8')
          .split('\n')
          .filter(Boolean)
          .map(line => line.trim().split('=')),
      ),
    ),
  ),
);

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: SOLIDITY_VERSION,
    settings: {
      evmVersion: 'cancun',
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
