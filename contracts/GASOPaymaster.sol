// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {PaymasterERC20} from "@openzeppelin/contracts/account/paymaster/extensions/PaymasterERC20.sol";
import {IEntryPoint, PackedUserOperation} from "@openzeppelin/contracts/interfaces/IERC4337.sol";
import {ERC4337Utils} from "@openzeppelin/contracts/account/utils/ERC4337Utils.sol";

/// @notice ERC-4337 GASO fee sponsorship: TESTNET PROTOTYPE ONLY.
/// @dev Manual GASO/ETH price is NOT market-based. Never fund with real assets.
///      Requires a smart account that has approved GASO allowance, a funded and
///      staked EntryPoint paymaster, and a compatible bundler. Not a full app.
contract GASOPaymaster is PaymasterERC20, Ownable {
    IERC20 public immutable gaso;
    IEntryPoint private immutable configuredEntryPoint;
    uint256 public tokenPerNative; // raw GASO units per 1 ETH
    bool public paused;

    event TokenPriceChanged(uint256 oldPrice, uint256 newPrice);
    event SponsorshipPaused(bool status);

    constructor(
        IERC20 gaso_,
        address initialOwner,
        IEntryPoint entryPoint_,
        uint256 initialTokenPerNative
    ) Ownable(initialOwner) {
        require(address(gaso_) != address(0), "Invalid GASO");
        require(address(entryPoint_) != address(0), "Invalid EntryPoint");
        require(initialTokenPerNative >= 1e18, "Test price too low");
        gaso = gaso_;
        configuredEntryPoint = entryPoint_;
        tokenPerNative = initialTokenPerNative;
    }

    function entryPoint() public view override returns (IEntryPoint) {
        return configuredEntryPoint;
    }

    function _fetchDetails(
        PackedUserOperation calldata,
        bytes32
    ) internal view override returns (uint256 validationData, IERC20 token, uint256 tokensPerNative) {
        return (
            paused ? ERC4337Utils.SIG_VALIDATION_FAILED : ERC4337Utils.SIG_VALIDATION_SUCCESS,
            gaso,
            tokenPerNative
        );
    }

    function _minTokensPerNative() internal pure override returns (uint256) {
        return 1e18; // test-only lower bound; not adequate production pricing protection
    }

    function setTestTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice >= 1e18, "Test price too low");
        emit TokenPriceChanged(tokenPerNative, newPrice);
        tokenPerNative = newPrice;
    }

    function setPaused(bool status) external onlyOwner {
        paused = status;
        emit SponsorshipPaused(status);
    }

    function deposit() external payable {
        require(msg.value > 0, "No ETH");
        _deposit(msg.value);
    }

    function withdrawDeposit(address payable recipient, uint256 amount) external onlyOwner {
        _withdraw(recipient, amount);
    }

    function addStake(uint32 unstakeDelaySec) external payable onlyOwner {
        require(msg.value > 0, "No ETH");
        _addStake(msg.value, unstakeDelaySec);
    }

    function unlockStake() external onlyOwner {
        _unlockStake();
    }

    function withdrawStake(address payable recipient) external onlyOwner {
        _withdrawStake(recipient);
    }

    function withdrawGASO(address recipient, uint256 amount) external onlyOwner {
        _withdrawTokens(gaso, recipient, amount);
    }
}
