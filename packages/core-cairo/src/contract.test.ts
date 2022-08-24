import test from 'ava';

import { BaseFunction, ContractBuilder } from './contract';
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

test('contract with constructor code with semicolon', t => {
  const Foo = new ContractBuilder();
  Foo.addConstructorCode('someFunction();');
  t.snapshot(printContract(Foo));
});

test('contract with function code', t => {
  const Foo = new ContractBuilder();
  Foo.addFunctionCode('someFunction()', _otherFunction);
  t.snapshot(printContract(Foo));
});

test('contract with function code with semicolon', t => {
  const Foo = new ContractBuilder();
  Foo.addFunctionCode('someFunction();', _otherFunction);
  t.snapshot(printContract(Foo));
});

test('contract with initializer params', t => {
  const Foo = new ContractBuilder();
  Foo.addModule(
    someModule,
    ['param1'],
    [],
    true
  );
  t.snapshot(printContract(Foo));
});

test('contract with library call', t => {
  const Foo = new ContractBuilder();
  Foo.addModule(
    someModule,
    [],
    [],
    false
  );
  Foo.addFunction(_libraryFunction);
  t.snapshot(printContract(Foo));
});

const someModule = {
  name: 'SomeLibrary',
  path: 'contracts/some/library',
  useNamespace: true
};

const _otherFunction: BaseFunction = {
  name: 'otherFunction',
  kind: 'external',
  args: [],
};

const _libraryFunction: BaseFunction = {
  module: someModule,
  name: 'libraryFunction',
  kind: 'external',
  args: [],
};