import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Context";
import deployedContracts from "../deployedContracts.json";
import Path from "../routes/path";
import '../styles/ProductPage.css';

const ProductPage = () => {
  const { productId } = useParams();
  const { signer, account } = useWeb3();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bought, setBought] = useState(false);
  const [score, setScore] = useState(0);
  const [scalingFactor, setScalingFactor] = useState(0);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
    fetchProductReviews();
    fetchProductScore();
    fetchMathScalingFactor();
    checkIfBought(); // eslint-disable-next-line
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

  const fetchProductScore = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        deployedContracts.ReputationSystem,
        [
          "function getProductFeedbackScore(uint productId) external view returns (uint)"
        ],
        provider
      );
      const score = await contract.getProductFeedbackScore(productId);
      setScore(Number(score));
    } catch (error) {
      console.error("Error fetching product score:", error);
    }
  };

  const fetchMathScalingFactor = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        deployedContracts.MathLib,
        ["function SCALING_FACTOR() external view returns (uint256)"],
        provider
        );
        const scalingFactor = await contract.SCALING_FACTOR();
        setScalingFactor(Number(scalingFactor));
    } catch (error) {
      console.error("Error fetching math scaling factor:", error);
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
      const pricePerUnit = ethers.parseEther(product.price.toString()); // eslint-disable-next-line
      const totalPrice = pricePerUnit * BigInt(quantity);


      const provider = signer.provider;
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;

      const estimatedGas = await contract.buyProduct.estimateGas(productId, quantity, true, { value: totalPrice.toString() });

      const gasLimit = estimatedGas + (estimatedGas * 25n) / 100n; // Add 25% buffer
      // eslint-disable-next-line
      const gasCost = gasPrice * BigInt(gasLimit);
      const gasCostLimit = ethers.parseEther('0.1'); // 0.1 ETH

      if (gasCost > gasCostLimit) {
        alert("Gas cost exceeds limit. Please reduce quantity.");
        return;
      }

      // wait for user confirmation
      const confirm = window.confirm(
        `You are about to buy ${quantity} item(s) for ${ethers.formatEther(totalPrice)} ETH.
         Gas cost: ${ethers.formatEther(gasCost)} ETH.
         Gas limit: ${gasLimit.toString()}.
         Gas cost limit: ${ethers.formatEther(gasCostLimit)} ETH.
         Continue?`
        );
      if (!confirm) return;

      // make transaction with gas limit
      // const tx = await contract.buyProduct(productId, quantity, true, { value: totalPrice.toString(), gasLimit: gasLimit });
      const tx = await contract.buyProduct(productId, quantity, true, { value: totalPrice.toString() });
      await tx.wait();
      alert("Purchase successful!");
      fetchProductDetails(); // ✅ Updates quantity after purchase
      await checkIfBought(); // ✅ Ensure button shows after purchase
    } catch (error) {
      console.error("Error buying product:", error);
      alert("Transaction failed!", error);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) return <p>Loading product details...</p>;

  return (
      <div className="App">
        <div className="App-header">
      <div className="product-container">
        <div className="product-header">
          <h2>{product.name}</h2>
          <div className="product-details">
            <p>{product.description}</p>
            <p>Price: {product.price} ETH</p>
            <p>Available: {product.quantity}</p>
            <p>Seller: {product.owner}</p>
          </div>

          <div className="button-group">
            {product.owner !== account && product.quantity > 0 ? (
                <div className="quantity-controls">
                  <div className="quantity-input-group">
                    <button
                        className="quantity-btn"
                        onClick={decrementQuantity}
                        disabled={quantity === 1}
                    >
                      -
                    </button>

                    <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={(e) => {
                          const value = Math.max(1, Math.min(product.quantity, Number(e.target.value)));
                          setQuantity(value);
                        }}
                        className="quantity-input"
                    />

                    <button
                        className="quantity-btn"
                        onClick={incrementQuantity}
                        disabled={quantity === product.quantity}
                    >
                      +
                    </button>
                  </div>

                  <p className="total-price">
                    Total: {(quantity * parseFloat(product.price)).toFixed(12)} ETH
                  </p>

                  <button className="buy-button" onClick={handleBuyProduct}>
                    Buy {quantity} Item{quantity > 1 ? 's' : ''}
                  </button>
                </div>
            ) : product.owner === account ? (
                <p className="warning-message">⚠️ You are the seller of this product.</p>
            ) : product.quantity === 0 ? (
                <p className="sold-out">Sold Out</p>
            ) : null}

            {bought && (
                <button onClick={() => navigate(`/feedback?productId=${product.id}`)}>
                  Leave a Review
                </button>
            )}

            <button onClick={() => navigate(Path.MAIN)}>Back to Main Menu</button>
          </div>
        </div>

        <div className="reviews-container">
          <div className="rating-score">
            <strong>Weighted Rating Score: {score / scalingFactor}</strong>
          </div>

          <h3>Reviews:</h3>
          {reviews.length > 0 ? (
              <ul className="reviews-list">
                {reviews.map((review, index) => (
                    <li className="review-item" key={index}>
                      <span className="review-rating">Rating: {review.rating}/5 ⭐</span>
                      <strong>Date:</strong> {review.timestamp}
                      <strong>Comment:</strong> {review.comments}
                    </li>
                ))}
              </ul>
          ) : (
              <p className="warning-message">No reviews yet.</p>
          )}
        </div>
      </div>
        </div>
        </div>
  );

  // return (
  //   <div>
  //     <h2>{product.name}</h2>
  //     <p>{product.description}</p>
  //     <p>Price: {product.price} ETH</p>
  //     <p>Available: {product.quantity}</p>
  //     <p>Seller: {product.owner}</p>
  //
  //     {/* Hide Buy Button for Sellers */}
  //     {product.owner !== account && product.quantity > 0 ? (
  //       <button onClick={handleBuyProduct}>Buy</button>
  //     ) : product.owner === account ? (
  //       <p>⚠️ You are the seller of this product.</p>
  //     ) : product.quantity === 0 ? (
  //       <p>Sold Out</p>
  //     ) : null}
  //
  //     {/* ✅ Always show "Leave a Review" button if the user has bought the product */}
  //     {bought && (
  //       <button onClick={() => navigate(`/feedback?productId=${product.id}`)}>
  //         Leave a Review
  //       </button>
  //     )}
  //
  //     {/* Add button for going back to the main menu */}
  //       <button onClick={() => navigate(Path.MAIN)}>Back to Main Menu</button>
  //
  //     <h3>Reviews:</h3>
  //     <p> <strong> Weighted Rating Score: {score / scalingFactor} </strong></p>
  //     {reviews.length > 0 ? (
  //       <ul>
  //         {reviews.map((review, index) => (
  //           <li key={index}>
  //             <strong>Rating:</strong> {review.rating} / 5 ⭐
  //             <br />
  //             <strong>Date:</strong> {review.timestamp}
  //             <br />
  //             <strong>Comment:</strong> {review.comments}
  //           </li>
  //         ))}
  //       </ul>
  //     ) : (
  //       <p>No reviews yet.</p>
  //     )}
  //   </div>
  // );
};

export default ProductPage;

