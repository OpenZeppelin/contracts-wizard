import test from 'ava';

import { ContractBuilder } from './contract';
import { printContract } from './print';

test('contract basics', t => {
  const Foo = new ContractBuilder('Foo');
  t.snapshot(printContract(Foo));
});

test('contract with a parent', t => {
  const Foo = new ContractBuilder('Foo');
  const Bar = { name: 'Bar', path: './Bar.sol' };
  Foo.addParent(Bar);
  t.snapshot(printContract(Foo));
});

test('contract with two parents', t => {
  const Foo = new ContractBuilder('Foo');
  const Bar = { name: 'Bar', path: './Bar.sol' };
  const Quux = { name: 'Quux', path: './Quux.sol' };
  Foo.addParent(Bar);
  Foo.addParent(Quux);
  t.snapshot(printContract(Foo));
});

test('contract with a parent with parameters', t => {
  const Foo = new ContractBuilder('Foo');
  const Bar = { name: 'Bar', path: './Bar.sol' };
  Foo.addParent(Bar, ["param1", "param2"]);
  t.snapshot(printContract(Foo));
});

test('contract with two parents only one with parameters', t => {
  const Foo = new ContractBuilder('Foo');
  const Bar = { name: 'Bar', path: './Bar.sol' };
  const Quux = { name: 'Quux', path: './Quux.sol' };
  Foo.addParent(Bar, ["param1", "param2"]);
  Foo.addParent(Quux);
  t.snapshot(printContract(Foo));
});

test('contract with an override', t => {
  const Foo = new ContractBuilder('Foo');
  const _beforeTokenTransfer = {
    name: '_beforeTokenTransfer',
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  };
  Foo.addOverride('ERC20', _beforeTokenTransfer);
  t.snapshot(printContract(Foo));
});

test('contract with two overrides', t => {
  const Foo = new ContractBuilder('Foo');
  const _beforeTokenTransfer = {
    name: '_beforeTokenTransfer',
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  };
  Foo.addOverride('ERC20', _beforeTokenTransfer);
  Foo.addOverride('ERC20Snapshot', _beforeTokenTransfer);
  t.snapshot(printContract(Foo));
});

test('contract with two different overrides', t => {
  const Foo = new ContractBuilder('Foo');
  const _beforeTokenTransfer = {
    name: '_beforeTokenTransfer',
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  };
  const otherFunction = {
    name: '_otherFunction',
    kind: 'internal' as const,
    args: [],
  };
  Foo.addOverride('ERC20', _beforeTokenTransfer);
  Foo.addOverride('OtherParent', _beforeTokenTransfer);
  Foo.addOverride('ERC20', otherFunction);
  Foo.addOverride('OtherParent', otherFunction);
  t.snapshot(printContract(Foo));
});
