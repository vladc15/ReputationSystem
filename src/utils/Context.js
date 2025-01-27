import { createContext, useContext, useState, useEffect  } from 'react';
import { ethers } from 'ethers';
import { MathLibArtifact } from '../artifacts/contracts/MathLib.sol/MathLib.json';
import { ProductPlatformArtifact } from '../artifacts/contracts/ProductPlatform.sol/ProductPlatform.json';
import { UserSystemArtifact } from '../artifacts/contracts/UserSystem.sol/UserSystem.json';
import { ProductSystemArtifact } from '../artifacts/contracts/ProductSystem.sol/ProductSystem.json';
import { ReputationSystemArtifact } from '../artifacts/contracts/ReputationSystem.sol/ReputationSystem.json';
import { deployedContracts } from '../utils/deployedContracts.json';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        const connectWalletMetamask = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(provider);

                    // Request account access and get the current account
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        const signer = provider.getSigner();
                        const account = await signer.getAddress();
                        const balance = await provider.getBalance(account);
                        setSigner(signer);
                        setAccount(account);
                        setBalance(balance);
                    } else {
                        await window.ethereum.request({ method: 'eth_requestAccounts' });
                        const signer = provider.getSigner();
                        const account = await signer.getAddress();
                        const balance = await provider.getBalance(account);
                        setSigner(signer);
                        setAccount(account);
                        setBalance(balance);
                    }

                    // Listen for account change (if the user switches accounts in MetaMask)
                    window.ethereum.on('accountsChanged', async (accounts) => {
                        if (accounts.length > 0) {
                            const signer = provider.getSigner();
                            const account = await signer.getAddress();
                            const balance = await provider.getBalance(account);
                            setSigner(signer);
                            setAccount(account);
                            setBalance(balance);
                        }
                    });

                    // Listen for network change (if the user switches network in MetaMask)
                    window.ethereum.on('chainChanged', (chainId) => {
                        window.location.reload();
                    });

                } catch (err) {
                    console.log('Error while requesting accounts or retrieving signer:', err);
                }
            } else {
                console.log('Ethereum provider not found');
            }
        };

        connectWalletMetamask();

        // Cleanup listeners on unmount
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged');
                window.ethereum.removeListener('chainChanged');
            }
        };
    }, []);

    const initializeWallet = async (newSigner) => {
        try {
            setSigner(newSigner);
            const account = await newSigner.getAddress();
            setAccount(account);
            const balance = await newSigner.provider.getBalance(account);
            setBalance(balance);
        } catch (err) {
            console.log('Error while initializing wallet:', err);
        }
    }

    return (
        <Web3Context.Provider value={{ provider, signer, account, balance, initializeWallet }}>
            {children}
        </Web3Context.Provider>
    );

};

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
}

export const useWeb3Provider = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3Provider must be used within a Web3Provider');
    }
    return context.provider;
}

export const initializeContracts = async () => {
    const mathLib = new ethers.Contract(
        deployedContracts.MathLib,
        MathLibArtifact.abi,
    );

    const userSystem = new ethers.Contract(
        deployedContracts.UserSystem,
        UserSystemArtifact.abi,
    );

    const reputationSystem = new ethers.Contract(
        deployedContracts.ReputationSystem,
        ReputationSystemArtifact.abi,
    );

    const productSystem = new ethers.Contract(
        deployedContracts.ProductSystem,
        ProductSystemArtifact.abi,
    );

    const productPlatform = new ethers.Contract(
        deployedContracts.ProductPlatform,
        ProductPlatformArtifact.abi,
    );

    return { mathLib, userSystem, reputationSystem, productSystem, productPlatform };
}