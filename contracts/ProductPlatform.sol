pragma solidity >=0.7.0 <0.9.0;

import {MathLib} from "./MathLib.sol";
import {ReputationSystem} from "./ReputationSystem.sol";
import {UserSystem} from "./UserSystem.sol";
import {ProductSystem} from "./ProductSystem.sol";

contract ProductPlatform {

    UserSystem public userSystem;
    ReputationSystem public reputationSystem;
    ProductSystem public productSystem;
    using MathLib for uint256;

    constructor(address userSystemAddress, address reputationSystemAddress, address productSystemAddress) {
        userSystem = UserSystem(userSystemAddress);
        reputationSystem = ReputationSystem(reputationSystemAddress);
        productSystem = ProductSystem(productSystemAddress);
    }

    modifier onlyRegistered() {
        require(userSystem.isRegistered(msg.sender), "User not registered");
        _;
    }

    modifier onlyUserWhoPurchased(uint productId) {
        bool purchased = false;
        for (uint i = 0; i < userSystem.userPurchases[msg.sender].length; i++) {
            if (userSystem.userPurchases[msg.sender][i] == productId) {
                purchased = true;
                break;
            }
        }
        require(purchased, "User has not purchased the product");
        _;
    }

    function addProduct(string memory name, string memory description, uint price, uint quantity) external onlyRegistered {
        uint productId = productSystem.products().length;
        productSystem.products.push(productSystem.Product(productId, name, description, price, msg.sender, 0, 0, quantity));
        emit productSystem.ProductAdded(productId, name, price, msg.sender);
    }

    // buy using either ETH or USD through Chainlink and oracle
    // we could also use this only to show price in USD, but use ETH for transactions
    function buyProduct(uint productId, uint quantity, bool eth) external payable onlyRegistered {
        uint productQuantity = productSystem.getProductQuantity(productId);
        address productSeller = productSystem.getProductSeller(productId);
        require(quantity > 0, "Quantity must be greater than 0");
        require(productQuantity >= quantity, "Not enough quantity in stock");

        uint256 productPrice = productSystem.getProductPrice(productId);
        uint256 msgValueInUsd = 0;
        uint256 ethPriceInUsd = userSystem.getETHPrice();
        if (eth == false) {
            productPrice = productPrice * ethPriceInUsd;
            msgValueInUsd = msg.value * ethPriceInUsd;
            require(msgValueInUsd >= productPrice * quantity, "Insufficient funds");
        }
        else {
            require(msg.value >= productPrice * quantity, "Insufficient funds");
        }

        userSystem.updateBalance(productSeller, productSystem.getProductPrice(productId) * quantity);
        productSystem.products[productId].quantity = productQuantity - quantity;
        userSystem.userPurchases[msg.sender].push(productId);
        if (productQuantity == quantity) {
            emit productSystem.ProductOutOfStock(productId);
        }

        if (eth) {
            uint256 change = msg.value - productPrice * quantity;
            if (change > 0) {
                // refund instantly the change
                payable(msg.sender).transfer(change);
            }
        }
        else {
            uint256 change = msgValueInUsd - productPrice * quantity;
            if (change > 0) {
                // refund instantly the change
                payable(msg.sender).transfer(change / ethPriceInUsd); // this might give accurate change, if the returned values are in wei
            }
        }

    }

    function submitFeedback(uint productId, uint rating, string memory comments) external onlyUserWhoPurchased(productId) {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        reputationSystem.addProductFeedback(productId, rating, block.timestamp, comments);
    }
}