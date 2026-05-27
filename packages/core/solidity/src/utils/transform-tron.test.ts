import test from 'ava';
import { rewriteForTron } from './transform-tron';

test('rewrites @openzeppelin/contracts path root', t => {
  t.is(
    rewriteForTron('import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";'),
    'import {Ownable} from "@openzeppelin/tron-contracts/access/Ownable.sol";',
  );
});

test('rewrites token directory names', t => {
  t.is(
    rewriteForTron('import "@openzeppelin/contracts/token/ERC20/ERC20.sol";'),
    'import "@openzeppelin/tron-contracts/token/TRC20/TRC20.sol";',
  );
  t.is(
    rewriteForTron('import "@openzeppelin/contracts/token/ERC721/ERC721.sol";'),
    'import "@openzeppelin/tron-contracts/token/TRC721/TRC721.sol";',
  );
  t.is(
    rewriteForTron('import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";'),
    'import "@openzeppelin/tron-contracts/token/TRC1155/TRC1155.sol";',
  );
});

test('rewrites token symbols and interfaces', t => {
  t.is(rewriteForTron('contract Foo is ERC20, ERC20Burnable {}'), 'contract Foo is TRC20, TRC20Burnable {}');
  t.is(rewriteForTron('contract Foo is ERC721Pausable {}'), 'contract Foo is TRC721Pausable {}');
  t.is(rewriteForTron('contract Foo is ERC1155Supply {}'), 'contract Foo is TRC1155Supply {}');
  t.is(rewriteForTron('contract Foo is ERC4626 {}'), 'contract Foo is TRC4626 {}');
  t.is(rewriteForTron('IERC20 token; IERC721 nft;'), 'ITRC20 token; ITRC721 nft;');
});

test('does NOT rewrite digit-adjacent unrelated standards', t => {
  // These are real OZ filenames that must pass through untouched.
  const samples = [
    'import "@openzeppelin/contracts/token/ERC20/extensions/ERC1363.sol";',
    'import "@openzeppelin/contracts/token/common/ERC2981.sol";',
    'import "@openzeppelin/contracts/account/utils/draft-ERC4337Utils.sol";',
    'import "@openzeppelin/contracts/token/ERC6909/ERC6909.sol";',
  ];
  const rewritten = samples.map(rewriteForTron);
  // Path root still rewrites; the symbols stay as-is.
  t.is(
    rewritten[0],
    'import "@openzeppelin/tron-contracts/token/TRC20/extensions/ERC1363.sol";',
    'ERC1363 must stay verbatim',
  );
  t.is(rewritten[1], 'import "@openzeppelin/tron-contracts/token/common/ERC2981.sol";', 'ERC2981 must stay verbatim');
  t.is(
    rewritten[2],
    'import "@openzeppelin/tron-contracts/account/utils/draft-ERC4337Utils.sol";',
    'ERC4337Utils must stay verbatim',
  );
  // ERC6909 is NOT renamed in tron-contracts (only ERC20/721/1155/4626 are).
  t.is(rewritten[3], 'import "@openzeppelin/tron-contracts/token/ERC6909/ERC6909.sol";', 'ERC6909 must stay verbatim');
});

test('preserves the entire program when no TRON-relevant tokens present', t => {
  // 0.8.20 is below the tron-solc cap, so it stays as-is.
  const source = 'pragma solidity ^0.8.20;\ncontract Plain { uint256 x; }\n';
  t.is(rewriteForTron(source), source);
});

test('caps pragma at 0.8.26 (the current tron-solc maximum)', t => {
  // Above the cap — downgraded.
  t.is(rewriteForTron('pragma solidity ^0.8.27;\ncontract Foo {}\n'), 'pragma solidity ^0.8.26;\ncontract Foo {}\n');
  t.is(rewriteForTron('pragma solidity ^0.8.30;\ncontract Foo {}\n'), 'pragma solidity ^0.8.26;\ncontract Foo {}\n');
  // At the cap — unchanged.
  t.is(rewriteForTron('pragma solidity ^0.8.26;\ncontract Foo {}\n'), 'pragma solidity ^0.8.26;\ncontract Foo {}\n');
  // Below the cap — unchanged.
  t.is(rewriteForTron('pragma solidity ^0.8.20;\ncontract Foo {}\n'), 'pragma solidity ^0.8.20;\ncontract Foo {}\n');
});

test('handles a realistic ERC20 wizard output', t => {
  const input = `// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    constructor(address initialOwner)
        ERC20("MyToken", "MTK")
        Ownable(initialOwner)
        ERC20Permit("MyToken")
    {}
}
`;
  const expected = `// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.26;

import {TRC20} from "@openzeppelin/tron-contracts/token/TRC20/TRC20.sol";
import {TRC20Burnable} from "@openzeppelin/tron-contracts/token/TRC20/extensions/TRC20Burnable.sol";
import {TRC20Permit} from "@openzeppelin/tron-contracts/token/TRC20/extensions/TRC20Permit.sol";
import {Ownable} from "@openzeppelin/tron-contracts/access/Ownable.sol";

contract MyToken is TRC20, TRC20Burnable, Ownable, TRC20Permit {
    constructor(address initialOwner)
        TRC20("MyToken", "MTK")
        Ownable(initialOwner)
        TRC20Permit("MyToken")
    {}
}
`;
  t.is(rewriteForTron(input), expected);
});
