const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ReputationSystem", function () {
    let reputationSystem;
    let mathLib;
    let owner, user;

    before(async () => {
        [owner, user] = await ethers.getSigners();

        const MathLib = await ethers.getContractFactory("MathLib");
        mathLib = await MathLib.deploy();
        await mathLib.waitForDeployment();

        // 2. Legătură manuală cu biblioteca înainte de deploy
        // const ReputationSystem = await ethers.getContractFactory("ReputationSystem", {
        //     libraries: {
        //         MathLib: await mathLib.getAddress() // Folosește adresa corectă
        //     }
        // });
        // it doesn't need the library specified manually, it will be linked automatically
        const ReputationSystem = await ethers.getContractFactory("ReputationSystem");

        reputationSystem = await ReputationSystem.deploy();
        await reputationSystem.waitForDeployment();

        console.log("MathLib address:", await mathLib.getAddress());
        console.log("ReputationSystem address:", await reputationSystem.getAddress());
    });

    it("Should submit and retrieve feedback", async function () {
        const productId = 1;
        const rating = 5;
        const comments = "Excellent product!";

        const tx = await reputationSystem.connect(owner).addProductFeedback(
            productId,
            rating,
            Math.floor(Date.now() / 1000),
            comments
        );
        await tx.wait();

        const count = await reputationSystem.getProductFeedbackCount(productId);
        expect(count.toString()).to.equal("1");

        const [feedback] = await reputationSystem.getProductFeedbacks(productId);
        expect(feedback.rating.toString()).to.equal(rating.toString());
        expect(feedback.comments).to.equal(comments);
    });

    it("Should calculate score with time decay", async function () {
        const productId = 2;
        const now = await time.latest();

        const tx1 = await reputationSystem.connect(user).addProductFeedback(productId, 5, now - 100, "");
        await tx1.wait();
        const tx2 = await reputationSystem.connect(user).addProductFeedback(productId, 3, now - 200, "");
        await tx2.wait();

        const scalingFactor = await mathLib.SCALING_FACTOR();

        const score = await reputationSystem.getProductFeedbackScore(productId);
        expect(Number(score)).to.be.closeTo(4 * Number(scalingFactor), 1); // allow error margin
    });

    it("Should prevent accessing non-existent feedbacks", async function () {
        await expect(
            reputationSystem.getProductFeedbacks(999)
        ).to.be.revertedWith("No feedbacks available for the product");
    });
});