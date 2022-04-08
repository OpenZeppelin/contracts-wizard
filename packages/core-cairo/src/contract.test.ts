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

test('contract with library call', t => {
  const Foo = new ContractBuilder();
  Foo.addParentLibrary(
    someModule,
    [],
    []
  );
  Foo.addFunction(_libraryFunction);
  t.snapshot(printContract(Foo));
});

const someModule = {
  name: 'SomeLibrary',
  path: 'contracts/some/library',
  useNameAsPrefix: true
};

const _otherFunction = {
  name: 'otherFunction',
  kind: 'external' as const,
  args: [],
};

const _libraryFunction = {
  module: someModule,
  name: 'libraryFunction',
  kind: 'external' as const,
  args: [],
};