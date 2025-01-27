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

    modifier onlyUserWhoPurchased(uint productId) {
        bool purchased = false;
        uint userPurchasesNumber = userSystem.getUserPurchasesNumber(msg.sender);
        uint[] memory userPurchases = userSystem.getUserPurchases(msg.sender);
        for (uint i = 0; i < userPurchasesNumber; i++) {
            uint purchasedProductId = userPurchases[i];
            if (purchasedProductId == productId) {
                purchased = true;
                break;
            }
        }
        require(purchased, "User has not purchased the product");
        _;
    }

    event ProductBought(uint productId, uint quantity, address buyer, address seller);

    // buy using either ETH or USD through Chainlink and oracle
    // we could also use this only to show price in USD, but use ETH for transactions
    function buyProduct(uint productId, uint quantity, bool eth) external payable {
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

//        userSystem.updateBalance(productSeller, productSystem.getProductPrice(productId) * quantity);
        // put this in order to make sure the updateBalance is called correctly (and it cannot be called from the UserSystem contract
        // without paying an amount of ETH equal to the amount to be updated)
        (bool success, ) = address(userSystem).call(abi.encodeWithSignature("updateBalance(address,uint256)", productSeller, productPrice * quantity));
        require(success, "Failed to update seller balance");
        userSystem.addUserPurchase(msg.sender, productId);
        productSystem.setProductQuantity(productId, productQuantity - quantity);

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
        emit ProductBought(productId, quantity, msg.sender, productSeller);
    }

    function submitFeedback(uint productId, uint rating, string memory comments) external onlyUserWhoPurchased(productId) {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        reputationSystem.addProductFeedback(productId, rating, block.timestamp, comments);
    }
}