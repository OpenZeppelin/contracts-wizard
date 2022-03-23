// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

// CAUTION
// In print.ts, we're assuming that some of the contracts ERC20Votes do not have an init function.
// If Solidity complains about a missing "override" specifier in any of the functions below,
// we have to remove the corresonding exceptions from print.ts.

abstract contract SafetyCheck0 is Initializable {
    function __Initializable_init() public {}
}

abstract contract SafetyCheck1 is ERC20Votes {
    function __ERC20Votes_init() public {}
}
