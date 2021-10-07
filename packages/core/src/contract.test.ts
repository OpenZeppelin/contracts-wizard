import test from 'ava';

import { ContractBuilder } from './contract';
import { printContract } from './print';
import { TAG_SECURITY_CONTACT } from './set-info';

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

test('contract with one override', t => {
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
  Foo.addOverride('ERC20', _beforeTokenTransfer);
  Foo.addOverride('ERC20Snapshot', _beforeTokenTransfer);
  t.snapshot(printContract(Foo));
});

test('contract with two different overrides', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addOverride('ERC20', _beforeTokenTransfer);
  Foo.addOverride('OtherParent', _beforeTokenTransfer);
  Foo.addOverride('ERC20', _otherFunction);
  Foo.addOverride('OtherParent', _otherFunction);
  t.snapshot(printContract(Foo));
});

test('contract with a modifier', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addModifier('whenNotPaused', _otherFunction);
  t.snapshot(printContract(Foo));
});

test('contract with a modifier and override', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addModifier('whenNotPaused', _otherFunction);
  Foo.addOverride('ERC20', _otherFunction);
  Foo.addOverride('OtherParent', _otherFunction);
  t.snapshot(printContract(Foo));
});

test('contract with constructor code', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addConstructorCode('_mint(msg.sender, 10 ether);');
  t.snapshot(printContract(Foo));
});

test('contract with constructor code and a parent', t => {
  const Foo = new ContractBuilder('Foo');
  const Bar = { name: 'Bar', path: './Bar.sol' };
  Foo.addParent(Bar, ["param1", "param2"]);
  Foo.addConstructorCode('_mint(msg.sender, 10 ether);');
  t.snapshot(printContract(Foo));
});

test('contract with function code', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addFunctionCode('_mint(msg.sender, 10 ether);', _otherFunction);
  t.snapshot(printContract(Foo));
});

test('contract with overriden function with code', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addOverride('Bar', _otherFunction);
  Foo.addFunctionCode('_mint(msg.sender, 10 ether);', _otherFunction);
  t.snapshot(printContract(Foo));
});

test('contract with one variable', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addVariable('uint value = 42;');
  t.snapshot(printContract(Foo));
});

test('contract with two variables', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addVariable('uint value = 42;');
  Foo.addVariable('string name = "john";');
  t.snapshot(printContract(Foo));
});

test('name with special characters', t => {
  const Foo = new ContractBuilder('foo bar baz');
  t.snapshot(printContract(Foo));
});

test('using for statement', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUsing({
    name: 'Counters',
    path: './Counters.sol',
  }, 'Counters.Counter');
  t.snapshot(printContract(Foo));
});

test('contract with info', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addNatspecTag(TAG_SECURITY_CONTACT, 'security@example.com');
  t.snapshot(printContract(Foo));
});


const _beforeTokenTransfer = {
  name: '_beforeTokenTransfer',
  kind: 'internal' as const,
  args: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
};

const _otherFunction = {
  name: '_otherFunction',
  kind: 'internal' as const,
  args: [],
};
