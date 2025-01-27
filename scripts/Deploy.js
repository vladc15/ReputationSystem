import {ethers} from "ethers";

const main = async () => {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);

    // Deploy MathLib
    const MathLib = await ethers.getContractFactory("MathLib");
    const mathLib = await MathLib.deploy();
    await mathLib.deployed();
    console.log("MathLib deployed to:", mathLib.address);

    // Deploy UserSystem
    const UserSystem = await ethers.getContractFactory("UserSystem");
    const userSystem = await UserSystem.deploy();
    await userSystem.deployed();
    console.log("UserSystem deployed to:", userSystem.address);

    // Deploy ReputationSystem
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.deployed();
    console.log("ReputationSystem deployed to:", reputationSystem.address);

    // Deploy ProductSystem
    const ProductSystem = await ethers.getContractFactory("ProductSystem");
    const productSystem = await ProductSystem.deploy();
    await productSystem.deployed();
    console.log("ProductSystem deployed to:", productSystem.address);

    // Deploy ProductPlatform
    const ProductPlatform = await ethers.getContractFactory("ProductPlatform");
    const productPlatform = await ProductPlatform.deploy(
        userSystem.address,
        reputationSystem.address,
        productSystem.address
    );
    await productPlatform.deployed();
    console.log("ProductPlatform deployed to:", productPlatform.address);

    // write all contract addresses to a file
    const fs = require('fs');
    const addresses = {
        MathLib: mathLib.address,
        UserSystem: userSystem.address,
        ReputationSystem: reputationSystem.address,
        ProductSystem: productSystem.address,
        ProductPlatform: productPlatform.address
    };
    fs.writeFileSync('../src/deployedContracts.json', JSON.stringify(addresses, null, 2));

    console.log("All contracts deployed successfully");
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
