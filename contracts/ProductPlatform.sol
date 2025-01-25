pragma solidity >=0.7.0 <0.9.0;

contract ProductPlatform {
    struct Feedback {
        uint256 rating;
        uint256 timestamp;
        string comments;
    }

    struct Product {
        uint id;
        string name;
        string description;
        uint price;
        address seller;
        uint quantity;
    }

    Product[] public products;

    mapping(address => uint) private balances; // balances should be private
    mapping(address => bool) public isRegistered;

    mapping(uint => Feedback[]) public productFeedbacks;

    event ProductAdded(uint productId, string name, uint price, address seller, uint quantity);
    event ProductOutOfStock(uint productId);
    event FeedbackSubmitted(uint productId, address reviewer, uint rating, string comments);

    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "User not registered");
        _;
    }

    function registerUser() external {
        isRegistered[msg.sender] = true;
        balances[msg.sender] = 0;
    }

    function addProduct(string memory name, string memory description, uint price, uint quantity) external onlyRegistered {
        uint productId = products.length;
        products.push(Product(productId, name, description, price, msg.sender, 0, 0, quantity));
        productFeedbacks[productId] = new Feedback[](0);
        emit ProductAdded(productId, name, price, msg.sender);
    }

    function getProduct(uint productId) external view returns (Product memory) {
        return products[productId];
    }

    function buyProduct(uint productId, uint quantity) external payable {
        Product storage product = products[productId];
        require(product.quantity >= quantity, "Not enough quantity in stock");
        require(msg.value >= product.price * quantity, "Insufficient funds");

        balances[product.seller] += msg.value;
        product.quantity -= quantity;

        if (product.quantity == 0) {
            emit ProductOutOfStock(productId);
        }

        uint change = msg.value - product.price * quantity;
        if (change > 0) {
            balances[msg.sender] += change;
        }
    }

    function withdrawBalance() external onlyRegistered { // withdrawal pattern
        uint amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function submitFeedback(uint productId, uint rating, string memory comments) external onlyRegistered {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");

        Feedback memory feedback = Feedback(rating, block.timestamp, comments);
        productFeedbacks[productId].push(feedback);

        Product storage product = products[productId];

        emit FeedbackSubmitted(productId, msg.sender, rating, comments);
    }

    function getProductFeedbackCount(uint productId) external view returns (uint) {
        return productFeedbacks[productId].length;
    }

    function getProductFeedbacks(uint productId) external view returns (Feedback[] memory) {
        return productFeedbacks[productId];
    }

    function getProductFeedback(uint productId, uint feedbackIndex) external view returns (Feedback memory) {
        return productFeedbacks[productId][feedbackIndex];
    }

    function getProductFeedbackScore(uint productId) external view returns (uint) {
        Feedback[] memory feedbacks = productFeedbacks[productId];
        uint totalScore = 0;

        for (uint i = 0; i < feedbacks.length; i++) {
            totalScore += calculateContribution(feedbacks[i].rating, feedbacks[i].timestamp);
        }

        return totalScore;
    }

    function calculateContribution(uint256 rating, uint256 timestamp) public pure returns (uint256) {
        uint256 timeElapsed = block.timestamp - timestamp; // weight will be based on time
        uint256 timeLimit = 365 days; // limit to 1 year
        uint256 weight = timeElapsed > timeLimit ? 0 : (timeLimit - timeElapsed);
        return (rating * weight) / 365 days; // linearly decrease weight over time
    }
}