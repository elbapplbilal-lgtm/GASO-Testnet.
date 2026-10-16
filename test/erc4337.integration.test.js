const { expect } = require("chai");
const { ethers } = require("hardhat");

// Pack ERC-4337 v0.7 fields into two uint128 halves.
const pack128 = (first, second) => ethers.toBeHex((BigInt(first) << 128n) | BigInt(second), 32);
const packPaymasterData = (paymasterAddress, verifyGas, postGas) =>
  ethers.concat([
    paymasterAddress,
    ethers.zeroPadValue(ethers.toBeHex(verifyGas), 16),
    ethers.zeroPadValue(ethers.toBeHex(postGas), 16)
  ]);

async function setup() {
  const [owner, recipient, bundler] = await ethers.getSigners();
  // Deploy the actual v0.7 EntryPoint implementation to the LOCAL test blockchain.
  const ep = await ethers.deployContract("EntryPoint");
  await ep.waitForDeployment();

  const token = await ethers.deployContract("GASO", [owner.address]);
  await token.waitForDeployment();

  const price = ethers.parseEther("1000"); // fake TEST exchange ratio, not an oracle price
  const pm = await ethers.deployContract("GASOPaymaster", [
    await token.getAddress(), owner.address, await ep.getAddress(), price
  ]);
  await pm.waitForDeployment();

  // A Paymaster pays ETH to EntryPoint, not GASO directly to blockchain miners.
  await (await pm.deposit({ value: ethers.parseEther("0.1") })).wait();
  await (await pm.addStake(1, { value: ethers.parseEther("0.1") })).wait();

  const factory = await ethers.deployContract("SimpleAccountFactory", [await ep.getAddress()]);
  await factory.waitForDeployment();
  const walletAddress = await factory["getAddress(address,uint256)"](owner.address, 0);
  await (await factory.createAccount(owner.address, 0)).wait();
  const wallet = await ethers.getContractAt("SimpleAccount", walletAddress);

  // Owner bootstraps allowance via a direct call (owner pays gas, wallet does not).
  await (await token.transfer(walletAddress, ethers.parseEther("500"))).wait();
  const approval = token.interface.encodeFunctionData("approve", [
    await pm.getAddress(), ethers.MaxUint256
  ]);
  await (await wallet.execute(await token.getAddress(), 0, approval)).wait();
  expect(await ethers.provider.getBalance(walletAddress)).to.equal(0n);

  return { owner, recipient, bundler, ep, token, pm, wallet, walletAddress };
}

async function signedOperation(ctx, callData) {
  const op = {
    sender: ctx.walletAddress,
    nonce: await ctx.ep.getNonce(ctx.walletAddress, 0),
    initCode: "0x",
    callData,
    accountGasLimits: pack128(400000n, 200000n),
    preVerificationGas: 100000n,
    gasFees: pack128(1000000000n, 2000000000n),
    paymasterAndData: packPaymasterData(await ctx.pm.getAddress(), 200000n, 200000n),
    signature: "0x"
  };
  // v0.7 SimpleAccount signs an Ethereum signed message of the EntryPoint op hash.
  const hash = await ctx.ep.getUserOpHash(op);
  op.signature = await ctx.owner.signMessage(ethers.getBytes(hash));
  return { op, hash };
}

describe("Real EntryPoint ERC-4337 integration (LOCAL hardhat only)", function () {
  this.timeout(120000);

  it("transfers 10 GASO with 0 ETH in smart account, pays GASO to Paymaster, and burns ETH deposit for gas", async function () {
    const ctx = await setup();
    const beforeDeposit = await ctx.ep.balanceOf(await ctx.pm.getAddress());
    const beforeWalletTokens = await ctx.token.balanceOf(ctx.walletAddress);

    const transfer = ctx.token.interface.encodeFunctionData("transfer", [
      ctx.recipient.address, ethers.parseEther("10")
    ]);
    const call = ctx.wallet.interface.encodeFunctionData("execute", [
      await ctx.token.getAddress(), 0, transfer
    ]);
    const { op, hash } = await signedOperation(ctx, call);

    // A funded LOCAL bundler signer calls the real EntryPoint contract directly.
    // This is not an RPC bundler (eth_sendUserOperation); it validates the real on-chain path.
    const transaction = await ctx.ep.connect(ctx.bundler).handleOps(
      [op], ctx.bundler.address, { gasLimit: 7000000 }
    );
    const receipt = await transaction.wait();

    let operationEvent;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== (await ctx.ep.getAddress()).toLowerCase()) continue;
      try {
        const parsed = ctx.ep.interface.parseLog(log);
        if (parsed && parsed.name === "UserOperationEvent") operationEvent = parsed;
      } catch (_) {}
    }

    expect(operationEvent, "EntryPoint did not report a UserOperationEvent").to.not.equal(undefined);
    expect(operationEvent.args.userOpHash).to.equal(hash);
    expect(operationEvent.args.success).to.equal(true);
    expect(await ctx.token.balanceOf(ctx.recipient.address)).to.equal(ethers.parseEther("10"));
    expect(await ctx.token.balanceOf(await ctx.pm.getAddress())).to.be.gt(0n);
    expect(await ctx.token.balanceOf(ctx.walletAddress)).to.be.lt(
      beforeWalletTokens - ethers.parseEther("10")
    );
    expect(await ctx.ep.balanceOf(await ctx.pm.getAddress())).to.be.lt(beforeDeposit);
    expect(await ethers.provider.getBalance(ctx.walletAddress)).to.equal(0n);
  });

  it("rejects sponsored operations when the Paymaster is paused", async function () {
    const ctx = await setup();
    await (await ctx.pm.setPaused(true)).wait();
    const call = ctx.wallet.interface.encodeFunctionData("execute", [
      await ctx.token.getAddress(),
      0,
      ctx.token.interface.encodeFunctionData("transfer", [ctx.recipient.address, 1n])
    ]);
    const { op } = await signedOperation(ctx, call);
    await expect(ctx.ep.connect(ctx.bundler).handleOps(
      [op], ctx.bundler.address, { gasLimit: 7000000 }
    )).to.be.reverted;
    expect(await ctx.token.balanceOf(ctx.recipient.address)).to.equal(0n);
  });
});
