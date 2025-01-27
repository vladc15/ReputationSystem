pragma solidity >=0.7.0 <0.9.0;

import {MathLib} from "./MathLib.sol";

contract ReputationSystem {
    struct Feedback {
        uint256 rating;
        uint256 timestamp;
        string comments;
    }

    mapping(uint => Feedback[]) public productFeedbacks;

    using MathLib for uint256;

    modifier feedbacksAvailable(uint productId, uint feedbackIndex) {
        require(productFeedbacks[productId].length > feedbackIndex, "No feedbacks available for the product");
        _;
    }

    event FeedbackSubmitted(uint productId, address reviewer, uint rating, string comments);

    function addProductFeedback(uint productId, uint rating, uint timestamp, string memory comments) external {
        if (productFeedbacks[productId].length == 0) {
            //productFeedbacks[productId] = new Feedback[](0);
        }

        Feedback memory feedback = Feedback(rating, timestamp, comments);
        productFeedbacks[productId].push(feedback);
        emit FeedbackSubmitted(productId, msg.sender, rating, comments);
    }

    function getProductFeedbackCount(uint productId) external view returns (uint) {
        return productFeedbacks[productId].length;
    }

//    function getProductFeedbacks(uint productId) external view feedbacksAvailable(productId, 0) returns (Feedback[] memory) {
//        return productFeedbacks[productId];
//    }

    function getProductFeedback(uint productId, uint feedbackIndex) external view feedbacksAvailable(productId, feedbackIndex) returns (Feedback memory) {
        return productFeedbacks[productId][feedbackIndex];
    }

    function getProductFeedbacksNumber(uint productId) external view returns (uint) {
        return productFeedbacks[productId].length;
    }

    function getProductFeedbackScore(uint productId) external view feedbacksAvailable(productId, 0) returns (uint) {
        //Feedback[] memory feedbacks = productFeedbacks[productId];
        uint totalScore = 0;
        uint256 currentTime = block.timestamp;

        for (uint i = 0; i < productFeedbacks[productId].length; i++) {
            totalScore += calculateContribution(productFeedbacks[productId][i].rating, currentTime, productFeedbacks[productId][i].timestamp);
        }

        return totalScore / productFeedbacks[productId].length; // already scaled, no need to use SCALING_FACTOR
    }

    function calculateContribution(uint256 rating, uint256 currentTime, uint256 timestamp) public pure returns (uint256) {
        uint256 timeElapsed = currentTime - timestamp; // weight will be based on time
        uint256 timeLimit = 365 days; // limit to 1 year
        uint256 weight = timeElapsed > timeLimit ? 0 : (timeLimit - timeElapsed);
        uint256 weightedRating = rating * weight;
        return weightedRating.floatingDivision(timeLimit); // linearly decrease weight over time
    }
}