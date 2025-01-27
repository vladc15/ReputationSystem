pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/tests/FeedConsumer.sol";

contract UserSystem {
    mapping(address => uint) private balances; // balances should be private
    mapping(address => uint[]) public userPurchases;

    FeedConsumer internal priceFeed = FeedConsumer(0x694AA1769357215DE4FAC081bf1f309aDC325306);

    // we could also use this only to show price in USD, but use ETH for transactions
    function getETHPrice() public view returns (uint) {
        (, int price, , ,) = priceFeed.latestRoundData();
        return uint(price);
    }

    function withdrawBalance(uint withdrawAmount) external { // withdrawal pattern
        uint amount = balances[msg.sender];
        require(amount >= withdrawAmount && withdrawAmount > 0, "Not enough balance to withdraw");

        balances[msg.sender] -= withdrawAmount;
        payable(msg.sender).transfer(withdrawAmount);
    }

    function getBalance() internal view returns (uint) {
        return balances[msg.sender];
    }

    function updateBalance(address user, uint amount) external payable {
        require(msg.value >= amount, "Incorrect amount sent");
        balances[user] += amount;
    }

    function getUserPurchasesNumber(address user) external view returns (uint) {
        return userPurchases[user].length;
    }

    function getUserPurchases(address user) external view returns (uint[] memory) {
        return userPurchases[user];
    }

    function addUserPurchase(address user, uint productId) external {
        userPurchases[user].push(productId);
    }
}