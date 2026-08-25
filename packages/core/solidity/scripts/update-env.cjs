const { rmSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const environments = [
  'src/environments/hardhat',
  'src/environments/hardhat/upgradeable',
  'src/environments/hardhat/polkadot',
  'src/environments/hardhat/tron',
  'src/environments/hardhat/tron/upgradeable',
  'src/environments/tronbox',
  'src/environments/tronbox/upgradeable',
];

const root = path.join(__dirname, '..');

for (const dir of environments) {
  const prefix = path.join(root, dir);
  rmSync(path.join(prefix, 'package-lock.json'), { force: true });
  const result = spawnSync('npm', ['install', '--package-lock-only', '--prefix', prefix], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
