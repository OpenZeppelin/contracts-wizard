import test from 'ava';

import type { BaseImplementedTrait } from './contract';
import { ContractBuilder } from './contract';
import { printContract } from './print';
import { getSelfArg } from './common-options';

test('contract basics', t => {
  const Foo = new ContractBuilder('Foo');
  t.snapshot(printContract(Foo));
});

test('contract with parent with function code before', t => {
  const Foo = new ContractBuilder('Foo');
  const trait: BaseImplementedTrait = {
    name: 'External',
    storage: {
      name: 'external',
      type: 'External',
    },
    modulePath: 'mod_ext',
    functions: [
      {
        name: 'someFunction',
        args: [getSelfArg('immutable')],
        code: ['self.external.someFunction();'],
      }
    ],
    interface: {
      name: 'IExternal',
    }
  };
  Foo.addImplementedTrait(trait);
  Foo.addFunctionCodeBefore(trait, trait.functions[0]!, ['before();']);
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
