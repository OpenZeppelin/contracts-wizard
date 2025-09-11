import test from 'ava';
import { inferTranspiled } from './infer-transpiled';

test('infer transpiled', t => {
  t.true(inferTranspiled({ name: 'Foo' }));
  t.true(inferTranspiled({ name: 'Foo', transpiled: true }));
  t.false(inferTranspiled({ name: 'Foo', transpiled: false }));

  t.false(inferTranspiled({ name: 'IFoo' }));
  t.true(inferTranspiled({ name: 'IFoo', transpiled: true }));
  t.false(inferTranspiled({ name: 'IFoo', transpiled: false }));

  t.true(inferTranspiled({ name: 'Ifoo' }));
  t.true(inferTranspiled({ name: 'Ifoo', transpiled: true }));
  t.false(inferTranspiled({ name: 'Ifoo', transpiled: false }));

  t.false(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/IFoo.sol' }));
  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/IFoo.sol', transpiled: true }));
  t.false(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/IFoo.sol', transpiled: false }));

  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/Ifoo.sol' }));
  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/Ifoo.sol', transpiled: true }));
  t.false(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/Ifoo.sol', transpiled: false }));

  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/Foo.sol' }));
  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/Foo.sol', transpiled: true }));
  t.false(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/Foo.sol', transpiled: false }));

  t.false(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/draft-IFoo.sol' }));
  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/draft-IFoo.sol', transpiled: true }));
  t.false(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/draft-IFoo.sol', transpiled: false }));

  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/draft-Ifoo.sol' }));
  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/draft-Ifoo.sol', transpiled: true }));
  t.false(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/draft-Ifoo.sol', transpiled: false }));

  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/draft-Foo.sol' }));
  t.true(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/draft-Foo.sol', transpiled: true }));
  t.false(inferTranspiled({ name: 'Foo', path: '@org/package/contracts/draft-Foo.sol', transpiled: false }));
});
