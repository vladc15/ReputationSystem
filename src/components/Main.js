import '../styles/Main.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import deployedContracts from '../deployedContracts.json';

export const Main = () => {
  const navigate = useNavigate();
  const [ethereumAddress, setEthereumAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [productSystemAddress] = useState(deployedContracts.ProductSystem);
  const [products, setProducts] = useState([]);

  const fetchAddress = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setEthereumAddress(address);
      setConnected(true);
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

  useEffect(() => {
    fetchAddress();
    fetchProducts();
  }, []);

  return (
    <div className="App">
      <div className="App-header">
        <h2>Connected to the Reputation System</h2>
        <p>My Address: {ethereumAddress}</p>

        {!connected && <button onClick={fetchAddress}>Connect Wallet</button>}

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
