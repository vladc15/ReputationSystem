const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductPlatform", function () {
    let platform;
    let productSystem;
    let userSystem;
    let reputationSystem;
    let owner, buyer;

    before(async () => {
        [owner, buyer] = await ethers.getSigners();

        const MathLib = await ethers.getContractFactory("MathLib");
        const mathLib = await MathLib.deploy();
        await mathLib.waitForDeployment();

        const UserSystem = await ethers.getContractFactory("UserSystem");
        userSystem = await UserSystem.deploy();
        await userSystem.waitForDeployment();

        // const ReputationSystem = await ethers.getContractFactory("ReputationSystem", {
        //     libraries: {
        //         MathLib: await mathLib.getAddress(),
        //     },
        // });
        const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
        reputationSystem = await ReputationSystem.deploy();
        await reputationSystem.waitForDeployment();

        const ProductSystem = await ethers.getContractFactory("ProductSystem");
        productSystem = await ProductSystem.deploy();
        await productSystem.waitForDeployment();

        const ProductPlatform = await ethers.getContractFactory("ProductPlatform");
        platform = await ProductPlatform.deploy(
            await userSystem.getAddress(),
            await reputationSystem.getAddress(),
            await productSystem.getAddress()
        );
        await platform.waitForDeployment();

    });

    it("Should complete purchase flow", async function () {
        const tx1 = await productSystem.connect(owner).addProduct("Book", "Best seller", ethers.parseEther("0.1"), 10);
        await tx1.wait();

        const tx2 = await platform.connect(buyer).buyProduct(0, 2, true, {
            value: ethers.parseEther("0.2")
        });
        await tx2.wait();

        const newQuantity = await productSystem.getProductQuantity(0);
        expect(newQuantity).to.equal(8);

        const purchases = await userSystem.getUserPurchases(buyer.address);
        expect(purchases[0]).to.equal(0);
    });
});