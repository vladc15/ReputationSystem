import React, { useState } from "react";
import { ethers } from "ethers";
import deployedContracts from "../deployedContracts.json";

const Feedback = () => {
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");

  const handleFeedbackSubmit = async () => {
    try {
      // Connect to Ethereum provider
      const provider = new ethers.BrowserProvider(window.ethereum); // Updated for ethers.js v6
      const signer = await provider.getSigner(); // Get the signer for transactions
      const reputationSystemAddress = deployedContracts.ReputationSystem;

      const reputationSystemAbi = [
        "function addProductFeedback(uint productId, uint rating, uint timestamp, string comments) external"
      ];

      // Create a contract instance
      const contract = new ethers.Contract(reputationSystemAddress, reputationSystemAbi, signer);

      // Call addProductFeedback function on the smart contract
      await contract.addProductFeedback(
        parseInt(productId), // Ensure productId is an integer
        parseInt(rating), // Ensure rating is an integer
        Math.floor(Date.now() / 1000), // Current timestamp in seconds
        comments
      );

      alert("Feedback submitted successfully!");

      // Reset the form fields
      setProductId("");
      setRating(0);
      setComments("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please check the console for details.");
    }
  };

  return (
    <div>
      <h2>Submit Feedback</h2>
      <div>
        <label>Product ID:</label>
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter product ID"
        />
      </div>
      <div>
        <label>Rating (1-5):</label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          placeholder="Enter rating"
        />
      </div>
      <div>
        <label>Comments:</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter your feedback comments"
        />
      </div>
      <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
    </div>
  );
};

export default Feedback;
