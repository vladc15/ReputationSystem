import '../styles/Main.css';
import '../styles/Main-Cards.css';
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
  const [lastWithdrawal, setLastWithdrawal] = useState([]);

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
        ['function getProducts() public view returns (tuple(uint, string, string, uint, address, uint)[])'],
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
        [
          "function getBalance() external view returns (uint)",
          "event Withdrawal(address user, uint amount)"
        ],
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
        [
          "function withdrawBalance(uint withdrawAmount) external",
          "event Withdrawal(address user, uint amount)"
        ],
        signer
      );

      const amountToWithdraw = ethers.parseUnits(sellerBalance, "ether"); // Convert to BigInt
      const tx = await contract.withdrawBalance(amountToWithdraw);
      await tx.wait();

      alert("Withdrawal successful!");
      await fetchSellerBalance(signer); // Refresh balance after withdrawal
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert("Transaction failed!");
    }
  };

  useEffect(() => {
    if (!connected) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.getSigner().then((signer) => {
      const contract = new ethers.Contract(
        userSystemAddress,
        ["event Withdrawal(address user, uint amount)"],
        signer
      );

      contract.on("Withdrawal", (user, amount) => {
        console.log("Withdrawal event received:", user, amount);
        setLastWithdrawal([user, ethers.formatEther(amount), new Date()]);
      });
    });

    return () => {
      provider.removeAllListeners(); // Cleanup event listeners on unmount
    };
  }, [connected]);

  useEffect(() => {
    fetchAddress();
    fetchProducts();
  }, [location.key]);

  return (
      <div className="App">
        <header className="App-header">
          <h1>Reputation System Marketplace</h1>

          <section className="user-info">
            {!connected ? (
                <div className="connection-section">
                  <p>Connect your wallet to start</p>
                  <button onClick={fetchAddress}>Connect Wallet</button>
                </div>
            ) : (
                <>
                  <div className="wallet-info">
                    <h2>Welcome, {ethereumAddress.slice(0, 6)}...{ethereumAddress.slice(-4)}</h2>
                    <div className="balance-section">
                      <h3>Total Earnings: <span className="highlight">{sellerBalance} ETH</span></h3>
                        {lastWithdrawal.length > 0 && (
                            <p>Last withdrawal: {lastWithdrawal[1]} ETH on {lastWithdrawal[2].toLocaleString()}</p>
                        )}
                      <div className="action-buttons">
                        <button
                            onClick={handleWithdraw}
                            disabled={sellerBalance === "0"}
                            aria-label="Withdraw all funds"
                            className="withdraw-button"
                        >
                          💰 Withdraw Funds
                        </button>
                        <button
                            onClick={() => navigate('/add-product')}
                            aria-label="Add new product"
                            className="add-product-button"
                        >
                          ➕ Add Product
                        </button>
                      </div>
                    </div>
                  </div>

                  <section className="products-section">
                    <h2>Available Products</h2>
                    {products.length === 0 ? (
                        <div className="empty-state">
                          <p>No products available yet.</p>
                          <p>Be the first to add one!</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                          {products.map((product) => (
                              <article key={product[0]} className="product-card">
                                <div className="product-header">
                                  <h3>{product[1]}</h3>
                                  <span className="stock-badge">
                          {product[5].toString()} in stock
                        </span>
                                </div>
                                <p className="product-description">{product[2]}</p>
                                <div className="product-footer">
                                  <div className="price-tag">
                                    {ethers.formatEther(product[3])} ETH
                                  </div>
                                  <button
                                      onClick={() => navigate(`/product/${product[0]}`)}
                                      className="details-button"
                                  >
                                    🔍 View Details
                                  </button>
                                </div>
                              </article>
                          ))}
                        </div>
                    )}
                  </section>
                </>
            )}
          </section>
        </header>
      </div>
  );
};
