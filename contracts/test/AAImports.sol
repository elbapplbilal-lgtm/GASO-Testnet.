// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

// Pull in the real ERC-4337 v0.7 EntryPoint and sample account contracts
// for LOCAL tests. These contracts are dependencies, not invented mocks.
import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/samples/SimpleAccountFactory.sol";
