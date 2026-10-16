# GASO CI result

- Source commit: `da60aa3a09ecefb5a743f0f34c0e6df0e885a56e`
- Compilation and tests: **PASS**
- Dependency installation: success
- Test step: success
- Test environment: GitHub Actions / local Hardhat (NOT Base Sepolia)

## Test output (last 100 lines)
\`\`\`text

> gaso-testnet@0.3.0 test
> hardhat test

Downloading compiler 0.8.28
Compiled 65 Solidity files successfully (evm target: cancun).


  Real EntryPoint ERC-4337 integration (LOCAL hardhat only)
    ✔ transfers 10 GASO with 0 ETH in smart account, pays GASO to Paymaster, and burns ETH deposit for gas (634ms)
    ✔ rejects sponsored operations when the Paymaster is paused (67ms)
    ✔ rejects operations with an invalid owner signature (63ms)
    ✔ rejects operations when GASO allowance for Paymaster is revoked (52ms)
    ✔ rejects operations if Paymaster's ETH deposit is fully withdrawn (53ms)

  GASO testnet prototype (unit tests only)
    ✔ mints exactly one million tokens to the initial holder
    ✔ rejects zero-address initial holder
    ✔ restricts test price changes and pause controls to owner


  8 passing (911ms)

\`\`\`
