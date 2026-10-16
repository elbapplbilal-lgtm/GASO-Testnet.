# GASO CI result

- Source commit: `b4e4a712988f041574b30731598b2a00814b46ee`
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
    ✔ transfers 10 GASO with 0 ETH in smart account, pays GASO to Paymaster, and burns ETH deposit for gas (438ms)
    ✔ rejects sponsored operations when the Paymaster is paused (50ms)

  GASO testnet prototype (unit tests only)
    ✔ mints exactly one million tokens to the initial holder
    ✔ rejects zero-address initial holder
    ✔ restricts test price changes and pause controls to owner


  5 passing (526ms)

\`\`\`
