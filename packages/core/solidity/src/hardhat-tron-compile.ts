import path from 'path';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';

process.env.HARDHAT_CONFIG = path.join(__dirname, '../hardhat.tron.config.js');

// Hardhat reads HARDHAT_CONFIG while loading, so this cannot be a hoisted import.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const hre = require('hardhat') as HardhatRuntimeEnvironment;

export default hre;
