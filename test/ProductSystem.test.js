const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductSystem", function () {
    let productSystem;
    let owner, addr1;

    beforeEach(async () => {
        [owner, addr1] = await ethers.getSigners();
        const ProductSystem = await ethers.getContractFactory("ProductSystem");
        productSystem = await ProductSystem.deploy();
        await productSystem.waitForDeployment();
    });

    it("Should add a new product", async function () {
        const tx = await productSystem.addProduct("Laptop", "High-end gaming", 1000, 5);
        await tx.wait();

        const product = await productSystem.getProduct(0);
        expect(product[1]).to.equal("Laptop");
        expect(product[5].toString()).to.equal("5");
    });

    it("Should update product quantity", async function () {
        let tx = await productSystem.connect(owner).addProduct("Phone", "Flagship", 800, 10);
        await tx.wait();

        tx = await productSystem.connect(owner).setProductQuantity(0, 5);
        await tx.wait();

        const product = await productSystem.getProduct(0);
        expect(product[5].toString()).to.equal("5");
    });
});