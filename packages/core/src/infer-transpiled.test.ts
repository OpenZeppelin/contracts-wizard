import test from 'ava';
import { inferTranspiled } from './infer-transpiled';

test('infer transpiled', t => {
  t.true(inferTranspiled('Foo'));
  t.false(inferTranspiled('IFoo'));
});