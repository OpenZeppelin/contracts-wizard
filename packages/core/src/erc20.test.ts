import test from 'ava';

import { buildERC20 } from './erc20';
import { printContract } from './print';

test('basic erc20', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
  });
  t.snapshot(printContract(c));
});

test('erc20 with snapshots', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    snapshots: true,
  });
  t.snapshot(printContract(c));
});

test('erc20 burnable', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    burnable: true,
  });
  t.snapshot(printContract(c));
});

test('erc20 burnable with snapshots', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    burnable: true,
    snapshots: true,
  });
  t.snapshot(printContract(c));
});

test('erc20 pausable', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    pausable: true,
    access: 'ownable',
  });
  t.snapshot(printContract(c));
});

test('erc20 pausable with roles', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    pausable: true,
    access: 'roles',
  });
  t.snapshot(printContract(c));
});

test('erc20 burnable pausable', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    burnable: true,
    pausable: true,
  });
  t.snapshot(printContract(c));
});

test('erc20 burnable pausable with snapshots', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    burnable: true,
    pausable: true,
    snapshots: true,
  });
  t.snapshot(printContract(c));
});

test('erc20 preminted', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    premint: '1000',
  });
  t.snapshot(printContract(c));
});

test('erc20 premint of 0', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    premint: '0',
  });
  t.snapshot(printContract(c));
});

test('erc20 mintable', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    mintable: true,
    access: 'ownable',
  });
  t.snapshot(printContract(c));
});

test('erc20 mintable with roles', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    mintable: true,
    access: 'roles',
  });
  t.snapshot(printContract(c));
});

test('erc20 permit', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    permit: true,
  });
  t.snapshot(printContract(c));
});

test('erc20 full upgradeable transparent', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    access: 'roles',
    burnable: true,
    mintable: true,
    pausable: true,
    snapshots: true,
    permit: true,
    upgradeable: 'transparent',
  });
  t.snapshot(printContract(c));
});

test('erc20 full upgradeable uups', t => {
  const c = buildERC20({
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    access: 'roles',
    burnable: true,
    mintable: true,
    pausable: true,
    snapshots: true,
    permit: true,
    upgradeable: 'uups',
  });
  t.snapshot(printContract(c));
});
