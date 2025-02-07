import test from 'ava';

import { ContractBuilder, BaseFunction, BaseImplementedTrait } from './contract';
import { printContract } from './print';

test('contract basics', t => {
  const Foo = new ContractBuilder('Foo');
  t.snapshot(printContract(Foo));
});

test('contract with constructor code', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addConstructorCode('someFunction()');
  t.snapshot(printContract(Foo));
});

test('contract with constructor code with semicolon', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addConstructorCode('someFunction();');
  t.snapshot(printContract(Foo));
});

test('contract with function code before', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: BaseImplementedTrait = {
    name: 'External',
    for: 'ExternalTrait',
    tags: [
      'othertag',
      'contractimpl',
    ],
    perItemTag: 'peritemtag', // TODO: remove perItemTag from contract model if not useful for Stellar
  };
  Foo.addImplementedTrait(trait);
  const fn: BaseFunction = {
    name: 'someFunction',
    args: [],
    code: [
      'someFunction()'
    ]
  };
  Foo.addFunction(trait, fn);
  Foo.addFunctionCodeBefore(trait, fn, ['before()']);
  t.snapshot(printContract(Foo));
});

test('contract with function code before with semicolons', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: BaseImplementedTrait = {
    name: 'External',
    for: 'ExternalTrait',
    tags: [
      'othertag',
      'contractimpl',
    ],
    perItemTag: 'peritemtag',
  };
  Foo.addImplementedTrait(trait);
  const fn: BaseFunction = {
    name: 'someFunction',
    args: [],
    code: [
      'someFunction();'
    ]
  };
  Foo.addFunction(trait, fn);
  Foo.addFunctionCodeBefore(trait, fn, ['before();']);
  t.snapshot(printContract(Foo));
});

test('contract with standalone import', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause('some::library', 'SomeLibrary');
  t.snapshot(printContract(Foo));
});

test('contract with grouped imports', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause('some::library', 'SomeLibrary');
  Foo.addUseClause('some::library', 'Misc');
  t.snapshot(printContract(Foo));
});
