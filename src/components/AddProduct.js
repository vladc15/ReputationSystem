import React, { useState } from "react";
import { ethers } from "ethers";
import deployedContracts from "../deployedContracts.json";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const handleAddProduct = async () => {
    try {
      // Connect to the Ethereum provider
      const provider = new ethers.BrowserProvider(window.ethereum); // Updated for ethers.js v6
      const signer = await provider.getSigner(); // Get signer for interaction

      // Address and ABI of the ProductSystem contract
      const productSystemAddress = deployedContracts.ProductSystem;
      const productSystemAbi = [
        "function addProduct(string name, string description, uint price, uint quantity) external"
      ];

      // Create contract instance
      const contract = new ethers.Contract(productSystemAddress, productSystemAbi, signer);

      // Call the addProduct function
      await contract.addProduct(
        name,
        description,
        ethers.parseUnits(price.toString(), "ether"), // Use parseUnits for handling price
        quantity
      );

      alert("Product added successfully!");
      // Reset form fields
      setName("");
      setDescription("");
      setPrice(0);
      setQuantity(0);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please check the console for more details.");
    }
  };

  return (
    <div>
      <h2>Add Product</h2>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
        />
      </div>
      <div>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description"
        />
      </div>
      <div>
        <label>Price (ETH):</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          placeholder="Enter product price"
        />
      </div>
      <div>
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          placeholder="Enter product quantity"
        />
      </div>
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
};

export default AddProduct;
