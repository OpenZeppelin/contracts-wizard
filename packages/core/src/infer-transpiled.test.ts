import test from 'ava';
import { inferTranspiled } from './infer-transpiled';

test('infer transpiled', t => {
  t.true(inferTranspiled({ name: 'Foo' }));
  t.true(inferTranspiled({ name: 'Foo', transpiled: true }));
  t.false(inferTranspiled({ name: 'Foo', transpiled: false }));

  t.false(inferTranspiled({ name: 'IFoo' }));
  t.true(inferTranspiled({ name: 'IFoo', transpiled: true }));
  t.false(inferTranspiled({ name: 'IFoo', transpiled: false }));
});