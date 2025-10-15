/* eslint-disable */

// Configure ts-node to use a test-specific tsconfig
const path = require('path');

require('ts-node').register({
  transpileOnly: true,
  project: path.join(__dirname, 'tsconfig.test.json'),
});
