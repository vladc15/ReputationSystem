import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Context";
import deployedContracts from "../deployedContracts.json";
import Path from "../routes/path";

const ProductPage = () => {
  const { productId } = useParams();
  const { signer, account } = useWeb3();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bought, setBought] = useState(false);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
    fetchProductReviews();
    checkIfBought();
  }, [productId, account]);

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
        id: Number(details[0]),
        name: details[1],
        description: details[2],
        price: ethers.formatEther(details[3]),
        owner: details[4],
        quantity: Number(details[5])
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
      
      const formattedReviews = feedbackList.map((feedback) => ({
        rating: Number(feedback[0]),
        timestamp: new Date(Number(feedback[1]) * 1000).toLocaleString(),
        comments: feedback[2],
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error("Error fetching product feedback:", error);
    }
  };

  const checkIfBought = async () => {
    if (!account) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        deployedContracts.UserSystem,
        ["function getUserPurchases(address user) external view returns (uint[])"],
        provider
      );

      const purchases = await contract.getUserPurchases(account);
      setBought(purchases.map(Number).includes(Number(productId))); // ✅ Ensuring correct comparison
    } catch (error) {
      console.error("Error checking purchase status:", error);
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
      fetchProductDetails(); // ✅ Updates quantity after purchase
      await checkIfBought(); // ✅ Ensure button shows after purchase
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

      {/* Hide Buy Button for Sellers */}
      {product.owner !== account && product.quantity > 0 ? (
        <button onClick={handleBuyProduct}>Buy</button>
      ) : product.owner === account ? (
        <p>⚠️ You are the seller of this product.</p>
      ) : product.quantity === 0 ? (
        <p>Sold Out</p>
      ) : null}

      {/* ✅ Always show "Leave a Review" button if the user has bought the product */}
      {bought && (
        <button onClick={() => navigate(`/feedback?productId=${product.id}`)}>
          Leave a Review
        </button>
      )}

      {/* Add button for going back to the main menu */}
        <button onClick={() => navigate(Path.MAIN)}>Back to Main Menu</button>

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
