import test from 'ava';

import { buildERC20, ERC20Options } from './erc20';
import { printContract } from './print';

import { erc20 } from '.';

function testERC20(title: string, opts: Partial<ERC20Options>) {
  test(title, t => {
    const c = buildERC20({
      name: 'MyToken',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ERC20Options) {
  test(title, t => {
    t.is(erc20.print(opts), printContract(buildERC20({
      name: 'MyToken',
      ...opts,
    })));
  });
}

testERC20('basic erc20', {});

testERC20('erc20 burnable', {
  burnable: true,
});

// testERC20('erc20 pausable', {
//   pausable: true,
// });

// testERC20('erc20 burnable pausable', {
//   burnable: true,
//   pausable: true,
// });

testERC20('erc20 full - complex name', {
  name: 'Custom  $ Token',
  burnable: true,
  // pausable: true,
});

testAPIEquivalence('erc20 API default');

testAPIEquivalence('erc20 API basic', { name: 'CustomToken' });

testAPIEquivalence('erc20 API full', {
  name: 'CustomToken',
  burnable: true,
  // pausable: true,
});

test('erc20 API assert defaults', async t => {
  t.is(erc20.print(erc20.defaults), erc20.print());
});
