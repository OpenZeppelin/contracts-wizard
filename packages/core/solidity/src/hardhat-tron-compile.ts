process.env.HARDHAT_CONFIG = require('path').join(__dirname, '../hardhat.tron.config.js');

const hre = require('hardhat');

export default hre as typeof import('hardhat');
