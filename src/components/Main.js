import '../styles/Main.css';
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../utils/Context'; // Corrected import
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import deployedContracts from '../deployedContracts.json'; // Ensure this file exists and is correctly structured

export const Main = () => {
  const navigate = useNavigate();

  const { signer, account, initializeWallet } = useWeb3(); // Updated to use `useWeb3`
  const [connected, setConnected] = useState(false);
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, quantity: 0 });

  const productSystemAddress = deployedContracts.ProductSystem; // Ensure this exists in deployedContracts.json
  const productPlatformAddress = deployedContracts.ProductPlatform;

  const clearForm = (bShow) => {
    setShowProductForm(bShow);
  };

  const handleAddProductButtonClick = () => {
    clearForm(true);
  };

  const handleCancelButtonClick = () => {
    clearForm(false);
  };

  const fetchProducts = async () => {
    try {
      const contract = new ethers.Contract(
        productSystemAddress,
        [
          'function getProducts() public view returns (tuple(uint, string, string, uint, address, uint)[])',
        ],
        signer
      );

      const productList = await contract.getProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProductSubmit = async () => {
    try {
      const contract = new ethers.Contract(
        productSystemAddress,
        [
          'function addProduct(string memory name, string memory description, uint price, uint quantity) external',
        ],
        signer
      );

      await contract.addProduct(
        newProduct.name,
        newProduct.description,
        ethers.toBigInt(ethers.parseUnits(newProduct.price.toString(), 'ether')),
        newProduct.quantity
      );

      alert('Product added successfully!');
      setNewProduct({ name: '', description: '', price: 0, quantity: 0 });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  useEffect(() => {
    if (account) {
      setConnected(true);
      fetchProducts();
    }
  }, [account]);

  return (
    <div className="App">
      <div className="App-header">
        <h2>Connected to the Reputation System</h2>
        <p>My Address: {account}</p>
        <p>ProductPlatform Address: {productPlatformAddress}</p>

        {/* Show Connect Wallet Button if Wallet is Not Connected */}
        {!connected && (
          <button onClick={initializeWallet}>Connect Wallet</button>
        )}

        {/* Show Navigation and Action Buttons if Wallet is Connected */}
        {connected && !showProductForm && (
          <>
            <button onClick={() => navigate('/transactions')}>Transactions</button>
            <button onClick={() => navigate('/feedback', { state: { productPlatformAddress } })}>
              Submit Feedback
            </button>
            <button onClick={handleAddProductButtonClick}>Add Product</button>
            <button onClick={() => navigate('/view-feedback')}>View Feedback</button>
          </>
        )}

        {/* Add Product Form */}
        {showProductForm && (
          <div>
            <h3>Add a New Product</h3>
            <div className="line-container">
              <div>
                <label>Product Name:</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <label>Description:</label>
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
              <div>
                <label>Price (ETH):</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label>Quantity:</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
                />
              </div>
              <br />
              <button onClick={handleAddProductSubmit}>Confirm</button>
              <button onClick={handleCancelButtonClick}>Cancel</button>
            </div>
          </div>
        )}

        {/* Display List of Products */}
        <h3>Available Products</h3>
        <ul>
          {products.map((product, index) => (
            <li key={index}>
              <strong>{product[1]}</strong>: {product[2]} -{' '}
              {ethers.formatEther(product[3])} ETH ({product[5]} in stock)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
