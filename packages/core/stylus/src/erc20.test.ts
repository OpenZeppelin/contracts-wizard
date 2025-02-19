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

testERC20('basic erc20 nonpermit', {
  permit: false
});

testERC20('erc20 burnable', {
  permit: false,
  burnable: true,
});

// testERC20('erc20 pausable', {
//   pausable: true,
// });

// testERC20('erc20 burnable pausable', {
//   burnable: true,
//   pausable: true,
// });

testERC20('erc20 permit', {
  permit: true,
});

testERC20('erc20 permit burnable', {
  permit: true,
  burnable: true,
});

// testERC20('erc20 permit pausable', {
//   permit: true,
//   pausable: true,
// });

// testERC20('erc20 permit burnable pausable', {
//   permit: true,
//   burnable: true,
//   pausable: true,
// });

testERC20('erc20 full - complex name', {
  name: 'Custom  $ Token',
  burnable: true,
  permit: true,
  // pausable: true,
});

testAPIEquivalence('erc20 API default');

testAPIEquivalence('erc20 API basic', { 
  name: 'CustomToken',
  permit: false
});

testAPIEquivalence('erc20 API full', {
  name: 'CustomToken',
  burnable: true,
  permit: true,
  // pausable: true,
});

test('erc20 API assert defaults', async t => {
  t.is(erc20.print(erc20.defaults), erc20.print());
});
