const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GASO testnet prototype (unit tests only)", function () {
  it("mints exactly one million tokens to the initial holder", async function () {
    const [owner] = await ethers.getSigners();
    const token = await ethers.deployContract("GASO", [owner.address]);
    await token.waitForDeployment();
    expect(await token.name()).to.equal("GASO");
    expect(await token.symbol()).to.equal("GASO");
    expect(await token.decimals()).to.equal(18n);
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
  });

  it("rejects zero-address initial holder", async function () {
    await expect(ethers.deployContract("GASO", [ethers.ZeroAddress])).to.be.revertedWith("Invalid holder");
  });

  it("restricts test price changes and pause controls to owner", async function () {
    const [owner, other] = await ethers.getSigners();
    const token = await ethers.deployContract("GASO", [owner.address]);
    // We use a placeholder EntryPoint address here; no real sponsored UserOp is sent.
    const paymaster = await ethers.deployContract("GASOPaymaster", [
      await token.getAddress(), owner.address, other.address, ethers.parseEther("1000")
    ]);
    await expect(paymaster.connect(other).setPaused(true)).to.be.reverted;
    await expect(paymaster.connect(other).setTestTokenPrice(ethers.parseEther("2000"))).to.be.reverted;
    await paymaster.setPaused(true);
    expect(await paymaster.paused()).to.equal(true);
    await paymaster.setTestTokenPrice(ethers.parseEther("2000"));
    expect(await paymaster.tokenPerNative()).to.equal(ethers.parseEther("2000"));
  });
});
