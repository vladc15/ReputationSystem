import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Context";
import deployedContracts from "../deployedContracts.json";

const ProductPage = () => {
  const { productId } = useParams();
  const { signer, account } = useWeb3();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bought, setBought] = useState(false);

  useEffect(() => {
    fetchProductDetails();
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

  const handleBuyProduct = async () => {
    if (!signer) {
      alert("Connect your wallet first!");
      return;
    }
    try {
      const contract = new ethers.Contract(
        deployedContracts.ProductSystem,
        [
          "function buyProduct(uint productId) external payable"
        ],
        signer
      );
      const tx = await contract.buyProduct(productId, { value: ethers.parseUnits(product.price, "ether") });
      await tx.wait();
      alert("Purchase successful!");
      setBought(true);
      fetchProductDetails(); // Refresh product info
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
        <button onClick={() => window.location.href = `/feedback?productId=${product.id}`}>
          Leave a Review
        </button>
      ) : (
        <p>Sold Out</p>
      )}
    </div>
  );
};

export default ProductPage;
