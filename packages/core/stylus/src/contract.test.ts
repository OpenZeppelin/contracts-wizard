import test from 'ava';

import type { BaseFunction, BaseImplementedTrait } from './contract';
import { ContractBuilder } from './contract';
import { printContract } from './print';

test('contract basics', t => {
  const Foo = new ContractBuilder('Foo');
  t.snapshot(printContract(Foo));
});

test('contract with function code before', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: BaseImplementedTrait = {
    name: 'External',
    storage: {
      name: 'external',
      type: 'External',
    },
    modulePath: 'mod_ext',
  };
  Foo.addImplementedTrait(trait);
  const fn: BaseFunction = {
    name: 'someFunction',
    args: [],
    code: ['someFunction();'],
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

test('contract with sorted use clauses', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addUseClause('some::library', 'SomeLibrary');
  Foo.addUseClause('another::library', 'AnotherLibrary');
  Foo.addUseClause('another::library', 'Foo', { alias: 'Custom2' });
  Foo.addUseClause('another::library', 'Foo', { alias: 'Custom1' });
  t.snapshot(printContract(Foo));
});

test('contract with sorted traits', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addFunction(
    { name: 'Z', storage: { name: 'z', type: 'Z' }, modulePath: 'mod_z' },
    { name: 'funcZ', args: [], code: [] },
  );
  Foo.addFunction(
    { name: 'A', storage: { name: 'a', type: 'A' }, modulePath: 'mod_a' },
    { name: 'funcA', args: [], code: [] },
  );
  Foo.addFunction(
    {
      name: 'Special',
      storage: { name: 'special', type: 'Special' },
      modulePath: 'mod_special',
      section: 'Special Section',
    },
    { name: 'funcSpecial', args: [], code: [] },
  );
  Foo.addFunction(
    { name: 'B', storage: { name: 'b', type: 'B' }, modulePath: 'mod_b' },
    { name: 'funcB', args: [], code: [] },
  );
  t.snapshot(printContract(Foo));
});

test('contract with documentation', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addDocumentation('Some documentation');
  t.snapshot(printContract(Foo));
});

test('contract with security info', t => {
  const Foo = new ContractBuilder('Foo');
  Foo.addSecurityTag('security@example.com');
  t.snapshot(printContract(Foo));
});
