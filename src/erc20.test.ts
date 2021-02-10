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
