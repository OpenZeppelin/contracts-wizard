import test from 'ava';

import { buildERC721, ERC721Options } from './erc721';
import { printContract } from './print';

function testERC721(title: string, opts: Partial<ERC721Options>) {
  test(title, t => {
    const c = buildERC721({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

testERC721('basic', {});

testERC721('burnable', {
  burnable: true,
});

testERC721('pausable', {
  pausable: true,
});

testERC721('mintable', {
  mintable: true,
});

testERC721('mintable + roles', {
  mintable: true,
  access: 'roles',
});

testERC721('full upgradeable', {
  mintable: true,
  pausable: true,
  burnable: true,
  upgradeable: true,
});
