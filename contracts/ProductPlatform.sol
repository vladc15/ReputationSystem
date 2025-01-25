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

    function buyProduct(uint productId, uint quantity) external payable onlyRegistered {
        uint productQuantity = productSystem.getProductQuantity(productId);
        uint productPrice = productSystem.getProductPrice(productId);
        address productSeller = productSystem.getProductSeller(productId);

        require(quantity > 0, "Quantity must be greater than 0");
        require(productQuantity >= quantity, "Not enough quantity in stock");
        require(msg.value >= productPrice * quantity, "Insufficient funds");

        userSystem.updateBalance(productSeller, productPrice * quantity);
        //productSystem.setProductQuantity(productId, productQuantity - quantity);
        productSystem.products(productId).quantity = productQuantity - quantity;
        userSystem.userPurchases[msg.sender].push(productId);
        if (productQuantity == quantity) {
            emit productSystem.ProductOutOfStock(productId);
        }

        uint change = msg.value - productPrice * quantity;
        if (change > 0) {
            // refund instantly the change
            payable(msg.sender).transfer(change);
        }
    }

    function submitFeedback(uint productId, uint rating, string memory comments) external onlyUserWhoPurchased(productId) {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        reputationSystem.addProductFeedback(productId, rating, block.timestamp, comments);
    }
}