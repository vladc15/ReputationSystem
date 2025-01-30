pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract UserSystem {
    mapping(address => uint) private balances; // balances should be private
    mapping(address => uint[]) public userPurchases;

    AggregatorV3Interface internal priceFeed;
    constructor() {
        priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306); // ETH/USD price feed
    }

    event Withdrawal(address user, uint amount);

    // we could also use this only to show price in USD, but use ETH for transactions
    function getETHPrice() public view returns (uint) {
        (, int price, , ,) = priceFeed.latestRoundData();
        return uint(price);
    }

    function withdrawBalance(uint withdrawAmount) external { // withdrawal pattern
        uint amount = balances[msg.sender];
        require(amount >= withdrawAmount && withdrawAmount > 0, "Not enough balance to withdraw");

        balances[msg.sender] -= withdrawAmount;
        // (bool success, ) = payable(msg.sender).call{value: withdrawAmount, gas: 70000}("");
        // require(success, "Transfer failed");
        payable(msg.sender).transfer(withdrawAmount);
        emit Withdrawal(msg.sender, withdrawAmount);
    }

    function getBalance() external view returns (uint) {
        return balances[msg.sender];
    }

    // function getContractBalance() external view returns (uint) {
    //     return address(this).balance;
    // }

    function updateBalance(address user, uint amount) external payable {
        require(msg.value >= amount, "Incorrect amount sent"); // msg.value is in wei, so amount should be the same
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