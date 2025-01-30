const hre = require("hardhat");

const main = async () => {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);

    // Deploy MathLib
    const MathLib = await hre.ethers.getContractFactory("MathLib");
    const mathLib = await MathLib.deploy(); // deploy and wait
    console.log("MathLib deployed to:", mathLib.target); // use mathLib.target to get the deployed address

    // Deploy UserSystem
    const UserSystem = await hre.ethers.getContractFactory("UserSystem");
    const userSystem = await UserSystem.deploy(); // deploy and wait
    console.log("UserSystem deployed to:", userSystem.target);

    // Deploy ReputationSystem
    const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy(); // deploy and wait
    console.log("ReputationSystem deployed to:", reputationSystem.target);

    // Deploy ProductSystem
    const ProductSystem = await hre.ethers.getContractFactory("ProductSystem");
    const productSystem = await ProductSystem.deploy(); // deploy and wait
    console.log("ProductSystem deployed to:", productSystem.target);

    // Deploy ProductPlatform
    const ProductPlatform = await hre.ethers.getContractFactory("ProductPlatform");
    const productPlatform = await ProductPlatform.deploy(
        userSystem.target,
        reputationSystem.target,
        productSystem.target
    ); // deploy and wait
    console.log("ProductPlatform deployed to:", productPlatform.target);

    // Write all contract addresses to a file
    const fs = require("fs");
    const path = require("path");
    const addresses = {
        MathLib: mathLib.target,
        UserSystem: userSystem.target,
        ReputationSystem: reputationSystem.target,
        ProductSystem: productSystem.target,
        ProductPlatform: productPlatform.target,
    };
    const addressesPath = path.resolve(__dirname, "../src/deployedContracts.json");
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

    console.log("All contracts deployed successfully");
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
