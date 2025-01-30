// test/UserSystem.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserSystem", function () {
    let userSystem;
    let owner, user;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();
        const UserSystem = await ethers.getContractFactory("UserSystem");
        userSystem = await UserSystem.deploy();
        await userSystem.waitForDeployment();
    });

    it("Should handle balance updates for msg.sender", async function () {
        const amount = ethers.parseEther("1.0");

        const tx = await userSystem.connect(owner).updateBalance(user.address, amount, { value: amount });
        await tx.wait(); // MUST USE !!!!!!!!!!!
                        // OTHERWISE, THE TEST WILL FAIL BECAUSE THE TRANSACTION IS NOT READY YET

        const userBalance = await userSystem.connect(user).getBalance();
        const ownerBalance = await userSystem.connect(owner).getBalance();
        expect(userBalance.toString()).to.equal(amount.toString());
        expect(ownerBalance.toString()).to.equal("0");
    });

    it("Should handle withdrawals for msg.sender", async function () {
        const amount = ethers.parseEther("1.0");

        const tx1 = await userSystem.connect(owner).updateBalance(user.address, amount, { value: amount });
        await tx1.wait();

        const tx2 = await userSystem.connect(user).withdrawBalance(amount);
        await tx2.wait();

        const balance = await userSystem.connect(user).getBalance();
        expect(balance.toString()).to.equal("0");
    });
});