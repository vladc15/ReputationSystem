import '../styles/Main.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import deployedContracts from '../deployedContracts.json';
import { useLocation } from "react-router-dom";

export const Main = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ethereumAddress, setEthereumAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [productSystemAddress] = useState(deployedContracts.ProductSystem);
  const [userSystemAddress] = useState(deployedContracts.UserSystem);
  const [products, setProducts] = useState([]);
  const [sellerBalance, setSellerBalance] = useState(0);

  const fetchAddress = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setEthereumAddress(address);
      setConnected(true);
      fetchSellerBalance(signer);
    }
  };

  const fetchProducts = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        productSystemAddress,
        [
          'function getProducts() public view returns (tuple(uint, string, string, uint, address, uint)[])',
        ],
        provider
      );

      const productList = await contract.getProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSellerBalance = async (signer) => {
    try {
      const contract = new ethers.Contract(
          userSystemAddress,
          ["function getBalance() external view returns (uint)"],
          signer
      );
      const balance = await contract.getBalance();
      setSellerBalance(ethers.formatEther(balance)); // Convert to ETH format
    } catch (error) {
      console.error('Error fetching seller balance:', error);
    }
  };
  const handleWithdraw = async () => {
    if (!connected) {
      alert("Connect your wallet first!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
          userSystemAddress,
          ["function withdrawBalance(uint withdrawAmount) external"],
          signer
      );
      const amountToWithdraw = ethers.parseUnits(sellerBalance, "ether"); // Convert to BigInt
      const tx = await contract.withdrawBalance(amountToWithdraw);
      await tx.wait();
      alert("Withdrawal successful!");
      fetchSellerBalance(signer); // Refresh balance after withdrawal
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert("Transaction failed!");
    }
  };

  useEffect(() => {
    fetchAddress();
    fetchProducts();
  }, [location.key]);

  return (
    <div className="App">
      <div className="App-header">
        <h2>Connected to the Reputation System</h2>
        <p>My Address: {ethereumAddress}</p>

        {!connected && <button onClick={fetchAddress}>Connect Wallet</button>}

        {/* Display Seller Balance */}
        {connected && (
            <div>
              <h3>Total Earnings: {sellerBalance} ETH</h3>
              <button onClick={handleWithdraw} disabled={sellerBalance === "0"}>
                Withdraw Funds
              </button>
            </div>
        )}

        {/* Add Product Button */}
        {connected && (
          <button onClick={() => navigate('/add-product')}>Add Product</button>
        )}

        <h3>Available Products</h3>
        <ul>
          {products.map((product, index) => (
            <li key={index}>
              <strong>{product[1]}</strong>: {product[2]} - {ethers.formatEther(product[3])} ETH ({product[5]} in stock)
              <button onClick={() => navigate(`/product/${product[0]}`)}>
                View Details
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
