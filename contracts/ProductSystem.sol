pragma solidity >=0.7.0 <0.9.0;

import {MathLib} from "./MathLib.sol";

contract ProductSystem  {
    struct Product {
        uint id;
        string name;
        string description;
        uint price;
        address seller;
        uint quantity;
    }

    Product[] public products;

    using MathLib for uint256;

    event ProductAdded(uint productId, string name, uint price, address seller, uint quantity);
    event ProductOutOfStock(uint productId);


//    function addProduct(string memory name, string memory description, uint price, uint quantity) external onlyRegistered {
//        uint productId = products.length;
//        products.push(Product(productId, name, description, price, msg.sender, 0, 0, quantity));
//        emit ProductAdded(productId, name, price, msg.sender);
//    }

    function getProduct(uint productId) external view returns (Product memory) {
        return products[productId];
    }

    function getProductPrice(uint productId) external view returns (uint) {
        return products[productId].price;
    }

    function getProductQuantity(uint productId) external view returns (uint) {
        return products[productId].quantity;
    }

//    function setProductQuantity(uint productId, uint quantity) external onlyRegistered {
//        products[productId].quantity = quantity;
//        if (quantity == 0) {
//            emit ProductOutOfStock(productId);
//        }
//    }

    function getProductSeller(uint productId) external view returns (address) {
        return products[productId].seller;
    }
}