import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Context";
import deployedContracts from "../deployedContracts.json";

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId"); // Get productId from URL
  const navigate = useNavigate();
  const { account } = useWeb3();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    checkIfUserBoughtProduct();
  }, [productId, account]);

  const checkIfUserBoughtProduct = async () => {
    if (!account) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        deployedContracts.UserSystem,
        ["function getUserPurchases(address user) external view returns (uint[])"],
        provider
      );

      const purchases = await contract.getUserPurchases(account);
      const hasBought = purchases.map(Number).includes(Number(productId));

      setIsEligible(hasBought);
      setIsLoading(false);

      if (!hasBought) {
        // Redirect back to product page if user didn't buy it
        alert("You must purchase this product before leaving a review!");
        navigate(`/product/${productId}`);
      }
    } catch (error) {
      console.error("Error checking purchase status:", error);
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const reputationSystemAddress = deployedContracts.ReputationSystem;

      const reputationSystemAbi = [
        "function addProductFeedback(uint productId, uint rating, uint timestamp, string comments) external"
      ];

      const contract = new ethers.Contract(reputationSystemAddress, reputationSystemAbi, signer);

      await contract.addProductFeedback(
        parseInt(productId), 
        parseInt(rating),
        Math.floor(Date.now() / 1000),
        comments
      );

      alert("Feedback submitted successfully!");
      navigate(`/product/${productId}`); // Redirect back to the product page after submission
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please check the console for details.");
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return isEligible ? (
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
  ) : null;
};

export default Feedback;
