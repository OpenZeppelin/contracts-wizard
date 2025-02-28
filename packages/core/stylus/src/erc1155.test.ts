import test from 'ava';

import type { ERC1155Options } from './erc1155';
import { buildERC1155 } from './erc1155';
import { printContract } from './print';

import { erc1155 } from '.';

function testERC1155(title: string, opts: Partial<ERC1155Options>) {
  test(title, t => {
    const c = buildERC1155({
      name: 'MyToken',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ERC1155Options) {
  test(title, t => {
    t.is(
      erc1155.print(opts),
      printContract(
        buildERC1155({
          name: 'MyToken',
          ...opts,
        }),
      ),
    );
  });
}

testERC1155('basic erc1155', {});

testERC1155('erc1155 burnable', {
  burnable: true,
});

// testERC1155('erc1155 pausable', {
//   pausable: true,
// });

// testERC1155('erc1155 burnable pausable', {
//   burnable: true,
//   pausable: true,
// });

testERC1155('erc1155 supply', {
  supply: true,
});

testERC1155('erc1155 supply burnable', {
  supply: true,
  burnable: true,
});

// testERC1155('erc1155 supply pausable', {
//   supply: true,
//   pausable: true,
// });

// testERC1155('erc1155 supply burnable pausable', {
//   supply: true,
//   burnable: true,
//   pausable: true,
// });

testERC1155('erc1155 full - complex name', {
  name: 'Custom  $ Token',
  burnable: true,
  supply: true,
  // pausable: true,
});

testAPIEquivalence('erc1155 API default');

testAPIEquivalence('erc1155 API basic', { name: 'CustomToken' });

testAPIEquivalence('erc1155 API full', {
  name: 'CustomToken',
  burnable: true,
  supply: true,
  // pausable: true,
});

test('erc1155 API assert defaults', async t => {
  t.is(erc1155.print(erc1155.defaults), erc1155.print());
});
