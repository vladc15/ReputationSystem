// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./DIDRegistry.sol";

contract ReputationSystem {
    struct Feedback {
        uint256 rating;
        uint256 timestamp;
        string comments;
    }

    mapping(address => Feedback[]) public feedbacks;
    DIDRegistry public didRegistry; // using the DIDRegistry contract

    event FeedbackSubmitted(address indexed from, address indexed to, uint256 rating, string comments);

    constructor(address _didRegistry) {
        didRegistry = DIDRegistry(_didRegistry);
    }

    modifier onlyRegisteredUsers(address user) {
        require(didRegistry.isRegistered(user), "User not registered in DIDRegistry");
        _;
    }

    function addFeedback(address to, uint256 rating, string calldata comments)
    external
    onlyRegisteredUsers(msg.sender)
    onlyRegisteredUsers(to)
    {
        require(msg.sender != to, "Cannot leave feedback for yourself.");
        require(rating > 0 && rating <= 10, "Score must be between 1 and 10.");

        feedbacks[to].push(Feedback(rating, block.timestamp, comments));
        emit FeedbackSubmitted(msg.sender, to, rating, comments);
    }

    function getFeedback(address user) external view returns (Feedback[] memory) {
        return feedbacks[user];
    }

    function getReputationScore(address user) external view returns (uint256) {
        Feedback[] memory userFeedbacks = feedbacks[user];
        uint256 totalScore = 0;

        for (uint256 i = 0; i < userFeedbacks.length; i++) {
            totalScore += calculateContribution(userFeedbacks[i].rating, userFeedbacks[i].timestamp);
        }

        return totalScore;
    }

    function calculateContribution(uint256 rating, uint256 timestamp) public pure returns (uint256) {
        uint256 timeElapsed = block.timestamp - timestamp; // weight will be based on time
        uint256 weight = timeElapsed > 365 days ? 0 : (365 days - timeElapsed); // limit to 1 year
        return (rating * weight) / 365 days; // linearly decrease weight over time
    }

}
