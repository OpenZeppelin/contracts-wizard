import test from 'ava';

import { ContractBuilder } from './contract';
import { printContract } from './print';

test('contract basics', t => {
  const Foo = new ContractBuilder();
  t.snapshot(printContract(Foo));
});

test('contract with constructor code', t => {
  const Foo = new ContractBuilder();
  Foo.addConstructorCode('someFunction()');
  t.snapshot(printContract(Foo));
});

test('contract with function code', t => {
  const Foo = new ContractBuilder();
  Foo.addFunctionCode('someFunction()', _otherFunction);
  t.snapshot(printContract(Foo));
});

const _otherFunction = {
  name: 'otherFunction',
  kind: 'external' as const,
  args: [],
};
