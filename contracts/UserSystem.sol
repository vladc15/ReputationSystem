pragma solidity >=0.7.0 <0.9.0;

contract UserSystem {
    mapping(address => uint) private balances; // balances should be private
    mapping(address => bool) public isRegistered;
    mapping(address => uint[]) public userPurchases;

    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "User not registered");
        _;
    }

    function registerUser() external {
        isRegistered[msg.sender] = true;
        balances[msg.sender] = 0;
    }

    function withdrawBalance() external onlyRegistered { // withdrawal pattern
        uint amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function getBalance() external view onlyRegistered returns (uint) {
        return balances[msg.sender];
    }

    function updateBalance(address user, uint amount) external onlyRegistered {
        balances[user] += amount;
    }
}