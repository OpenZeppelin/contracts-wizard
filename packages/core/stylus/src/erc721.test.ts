import test from 'ava';

import { buildERC721, ERC721Options } from './erc721';
import { printContract } from './print';

import { erc721 } from '.';

function testERC721(title: string, opts: Partial<ERC721Options>) {
  test(title, t => {
    const c = buildERC721({
      name: 'MyToken',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ERC721Options) {
  test(title, t => {
    t.is(
      erc721.print(opts),
      printContract(
        buildERC721({
          name: 'MyToken',
          ...opts,
        })
      )
    );
  });
}

testERC721('basic erc721', {});

testERC721('erc721 burnable', {
  burnable: true,
});

testERC721('erc721 enumerable', {
  enumerable: true,
});

testERC721('erc721 burnable enumerable', {
  burnable: true,
  enumerable: true,
});

// testERC721('erc721 pausable', {
//   pausable: true,
// });

// testERC721('erc721 burnable pausable', {
//   burnable: true,
//   pausable: true,
// });

// testERC721('erc721 enumerable pausable', {
//   enumerable: true,
//   pausable: true,
// });

testERC721('erc721 full - complex name', {
  name: 'Custom  $ Token',
  burnable: true,
  enumerable: true,
  // pausable: true,
});

testAPIEquivalence('erc721 API default');

testAPIEquivalence('erc721 API basic', { name: 'CustomToken' });

testAPIEquivalence('erc721 API full', {
  name: 'CustomToken',
  burnable: true,
  enumerable: true,
  // pausable: true,
});

test('erc721 API assert defaults', async t => {
  t.is(erc721.print(erc721.defaults), erc721.print());
});
