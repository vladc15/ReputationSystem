import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Context";
import deployedContracts from "../deployedContracts.json";

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { signer, account } = useWeb3();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bought, setBought] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
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
        id: details[0].toString(),
        name: details[1],
        description: details[2],
        price: ethers.formatEther(details[3]), // Convert price from wei to ETH
        owner: details[4],
        quantity: details[5].toString() // Convert quantity to string
      });

      if (account && details[4].toLowerCase() === account.toLowerCase()) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        deployedContracts.ReputationSystem,
        [
          "function getProductReviews(uint productId) public view returns (tuple(uint, address, uint, string)[])"
        ],
        provider
      );

      const reviewsList = await contract.getProductReviews(productId);
      setReviews(
        reviewsList.map((review) => ({
          id: review[0].toString(),
          reviewer: review[1],
          rating: review[2].toString(),
          comment: review[3],
        }))
      );
    } catch (error) {
      console.error("Error fetching reviews:", error);
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

      const tx = await contract.buyProduct(productId, 1, true, {
        value: ethers.parseUnits(product.price, "ether")
      });

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
      <p><strong>Available:</strong> {product.quantity} in stock</p>
      <p>Seller: {product.owner}</p>

      {!bought && parseInt(product.quantity) > 0 && !isOwner ? (
        <button onClick={handleBuyProduct}>Buy</button>
      ) : bought ? (
        <button onClick={() => navigate(`/feedback?productId=${product.id}`)}>
          Leave a Review
        </button>
      ) : isOwner ? (
        <p><strong>You own this product.</strong></p>
      ) : (
        <p>Sold Out</p>
      )}

      <h3>Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <strong>Rating:</strong> {review.rating}/5 <br />
              <strong>Comment:</strong> {review.comment} <br />
              <strong>Reviewer:</strong> {review.reviewer}
            </li>
          ))}
        </ul>
      )}

      {/* If the user has bought the product, they can add a review */}
      {bought && (
        <button onClick={() => navigate(`/feedback?productId=${product.id}`)}>
          Add Review
        </button>
      )}
    </div>
  );
};

export default ProductPage;
