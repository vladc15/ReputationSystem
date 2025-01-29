import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(browserProvider);

          // Request account access and get current account
          const accounts = await browserProvider.send("eth_requestAccounts", []);
          if (accounts.length > 0) {
            const walletSigner = await browserProvider.getSigner();
            const walletAccount = await walletSigner.getAddress();
            const walletBalance = await browserProvider.getBalance(walletAccount);

            setSigner(walletSigner);
            setAccount(walletAccount);
            setBalance(ethers.formatEther(walletBalance));
          }

          // Add listeners for account and chain changes
          const handleAccountsChanged = async (accounts) => {
            if (accounts.length > 0) {
              const walletSigner = await browserProvider.getSigner();
              const walletAccount = accounts[0];
              const walletBalance = await browserProvider.getBalance(walletAccount);

              setSigner(walletSigner);
              setAccount(walletAccount);
              setBalance(ethers.formatEther(walletBalance));
            } else {
              setSigner(null);
              setAccount(null);
              setBalance(null);
            }
          };

          const handleChainChanged = () => {
            window.location.reload();
          };

          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);

          // Cleanup listeners when component unmounts
          return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum.removeListener("chainChanged", handleChainChanged);
          };
        } catch (err) {
          console.error("Error connecting to MetaMask:", err);
        }
      } else {
        console.error("MetaMask is not installed!");
      }
    };

    connectWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      const walletSigner = await provider.getSigner();
      const walletAccount = await walletSigner.getAddress();
      const walletBalance = await provider.getBalance(walletAccount);

      setSigner(walletSigner);
      setAccount(walletAccount);
      setBalance(ethers.formatEther(walletBalance));
    } catch (err) {
      console.error("Error initializing wallet:", err);
    }
  };

  return (
    <Web3Context.Provider value={{ provider, signer, account, balance, initializeWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
