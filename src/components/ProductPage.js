import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Context";
import deployedContracts from "../deployedContracts.json";

const ProductPage = () => {
  const { productId } = useParams();
  const { signer, account } = useWeb3();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bought, setBought] = useState(false);
  const [reviews, setReviews] = useState([]); // Store reviews
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
    fetchProductReviews();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        deployedContracts.ProductSystem,
        [
          "function getProduct(uint productId) public view returns (tuple(uint, string, string, uint, address, uint))"
        ],
        provider
      );
      const details = await contract.getProduct(productId);
      setProduct({
        id: details[0],
        name: details[1],
        description: details[2],
        price: ethers.formatEther(details[3]),
        owner: details[4],
        quantity: details[5]
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        deployedContracts.ReputationSystem,
        [
          "function getProductFeedbacks(uint productId) external view returns (tuple(uint rating, uint timestamp, string comments)[])"
        ],
        provider
      );

      const feedbackList = await contract.getProductFeedbacks(productId);
      
      // ✅ Fix: Ensure the rating is correctly extracted
      const formattedReviews = feedbackList.map((feedback) => ({
        rating: Number(feedback[0]), // Extract rating properly
        timestamp: new Date(Number(feedback[1]) * 1000).toLocaleString(), // Convert timestamp
        comments: feedback[2],
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error("Error fetching product feedback:", error);
    }
  };

  const handleBuyProduct = async () => {
    if (!signer) {
      alert("Connect your wallet first!");
      return;
    }
    try {
      const contract = new ethers.Contract(
        deployedContracts.ProductPlatform,
        [
          "function buyProduct(uint productId, uint quantity, bool eth) external payable"
        ],
        signer
      );
      const tx = await contract.buyProduct(productId, 1, true, { value: ethers.parseUnits(product.price, "ether") });
      await tx.wait();
      alert("Purchase successful!");
      setBought(true);
      fetchProductDetails();
    } catch (error) {
      console.error("Error buying product:", error);
      alert("Transaction failed!");
    }
  };

  if (loading) return <p>Loading product details...</p>;

  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: {product.price} ETH</p>
      <p>Available: {product.quantity}</p>
      <p>Seller: {product.owner}</p>

      {!bought && product.quantity > 0 ? (
        <button onClick={handleBuyProduct}>Buy</button>
      ) : bought ? (
        <button onClick={() => navigate(`/feedback?productId=${product.id}`)}>
          Leave a Review
        </button>
      ) : (
        <p>Sold Out</p>
      )}

      <h3>Reviews:</h3>
      {reviews.length > 0 ? (
        <ul>
          {reviews.map((review, index) => (
            <li key={index}>
              <strong>Rating:</strong> {review.rating} / 5 ⭐
              <br />
              <strong>Date:</strong> {review.timestamp}
              <br />
              <strong>Comment:</strong> {review.comments}
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
};

export default ProductPage;
