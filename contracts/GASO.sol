// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Educational, testnet-only GASO token. It has no guaranteed value.
contract GASO is ERC20 {
    constructor(address initialHolder) ERC20("GASO", "GASO") {
        require(initialHolder != address(0), "Invalid holder");
        _mint(initialHolder, 1_000_000 * 10 ** decimals());
    }
}
