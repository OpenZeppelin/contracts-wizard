const SOLIDITY_VERSION = require('@openzeppelin/wizard/src/solidity-version.json');

require('@fhevm/hardhat-plugin');

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
