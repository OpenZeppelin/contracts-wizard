// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// CAUTION
// In print.ts, we're assuming that some of the contracts do not have an init function.
// If Solidity complains about a missing "override" specifier in any of the functions below,
// we have to remove the corresponding exceptions from print.ts.

abstract contract SafetyCheck0 is Initializable {
    function __Initializable_init() public {}
}
