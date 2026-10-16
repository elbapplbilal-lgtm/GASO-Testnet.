# GASO — Token + ERC-4337 Paymaster (experimental)

**Language:** [شرح بالعربية](docs/NEXT_STEPS_AR.md)

GASO is an experimental ERC-20 token and paymaster design that explores paying a transaction's **economic gas cost in GASO** while a Paymaster pays network ETH via EntryPoint.

> **TEST ONLY.** GASO has no exchange listing, price, or guaranteed value. The code is not audited, and nothing here is proof of a Base Sepolia or mainnet deployment.

## What's implemented?

- `contracts/GASO.sol`: fixed supply 1,000,000 GASO, 18 decimals.
- `contracts/GASOPaymaster.sol`: OpenZeppelin ERC-20 Paymaster with owner pause, manual test price, EntryPoint deposit and stake controls.
- `test/gaso.test.js`: ERC-20 minting, invalid holder, owner permissions.
- `contracts/test/AAImports.sol`: imports **real ERC-4337 EntryPoint v0.7** and **SimpleAccountFactory** for local testing.
- `test/erc4337.integration.test.js`: local Hardhat test executing an owner-signed `UserOperation` through **real EntryPoint.handleOps**. The smart account has **0 ETH**, pays in GASO (prior approval is needed), and Paymaster uses its ETH deposit.

## Run (desktop or GitHub Actions)

```bash
npm install --no-audit --no-fund
npm test
```

See [Actions](../../actions) for automatic tests and [CI_RESULT.md](CI_RESULT.md) if the GitHub bot was able to commit an explicit output report.

## What this test proves — and what it doesn't

**If integration test passes:** a smart account with zero ETH can execute a token transfer through an actual v0.7 EntryPoint **on a locally simulated chain**, with fees deducted in GASO by our Paymaster. The local bundler role is simulated by a funded Hardhat signer that submits `handleOps` directly.

**Not yet proved:** a real public bundler (`eth_sendUserOperation`) supports our Paymaster in the public mempool, a GASO transfer on Base Sepolia was finalized, any real user wallet is compatible, or the service can stay solvent on real-valued gas/market-price movements.

## Preconditions to go on Base Sepolia

1. Successful compilation and unit/integration tests.
2. Actual Base Sepolia deployment of token and Paymaster with owner-approved **testnet-only** signing.
3. Fund Paymaster's EntryPoint ETH deposit and stake (testnet ETH).
4. Deploy/create an ERC-4337 smart account, fund with TEST GASO, obtain allowance for Paymaster.
5. Use a compatible public bundler and send a signed `UserOperation`.
6. Verify `UserOperationEvent.success == true`, GASO collected and ETH deposit charged using the Base Sepolia block explorer.

No private keys or seed phrases should be sent to anyone or to ChatGPT. Never use real assets with this unaudited prototype.

## Economic caution

The price `tokenPerNative` is a **manual test value**. It is not an oracle or market quote. Production design requires risk limits, market-based pricing, anti-abuse, funded gas operations, compatible bundlers, and a professional security audit.
