import React, { useState } from "react";
import { ethers } from "ethers";
import deployedContracts from "../deployedContracts.json";
import { useNavigate } from "react-router-dom";
import Path from "../routes/path";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const navigate = useNavigate();

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
      const tx = await contract.addProduct(
        name,
        description,
        ethers.parseUnits(price.toString(), "wei"), // Use parseUnits for handling price
        quantity
      );
      await tx.wait(); // Wait for the transaction to be mined

      alert("Product added successfully!");
      // Reset form fields
      setName("");
      setDescription("");
      setPrice(0);
      setQuantity(0);
      navigate(Path.MAIN, { state: { reload: true } });
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
        <label>Price (Wei):</label>
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
