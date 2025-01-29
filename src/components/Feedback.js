import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import deployedContracts from "../deployedContracts.json";

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId"); // Get productId from URL
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");

  const handleFeedbackSubmit = async () => {
    try {
      // Connect to Ethereum provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const reputationSystemAddress = deployedContracts.ReputationSystem;

      const reputationSystemAbi = [
        "function addProductFeedback(uint productId, uint rating, uint timestamp, string comments) external"
      ];

      const contract = new ethers.Contract(reputationSystemAddress, reputationSystemAbi, signer);

      // Call addProductFeedback function
      await contract.addProductFeedback(
        parseInt(productId), 
        parseInt(rating),
        Math.floor(Date.now() / 1000),
        comments
      );

      alert("Feedback submitted successfully!");

      // Reset fields
      setRating(0);
      setComments("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please check the console for details.");
    }
  };

  return (
    <div>
      <h2>Submit Feedback for Product ID: {productId}</h2>
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
