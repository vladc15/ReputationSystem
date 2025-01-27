const ethers = require('ethers');

const provider = new ethers.BrowserProvider(window.ethereum);

// const scanprovider = new ethers.EtherscanProvider("sepolia");
//
// const connectWalletMetamask = async (accountChangedHandler) => {
//   if (window.ethereum) {
//     try {
//       await provider.send("eth_requestAccounts", []);
//
//       let signer;
//
//       while (!signer) {
//         signer = await provider.getSigner().catch(() => null);
//         if (signer) {
//           accountChangedHandler(signer);
//           break;
//         } else {
//           await new Promise(resolve => setTimeout(resolve, 100));
//         }
//       }
//     } catch (err) {
//       console.log("Error while requesting accounts or retrieving signer:", err);
//     }
//   } else {
//     console.log("Ethereum provider not found");
//   }
// }

// const fetchTransactions = async (account) => {
//
//   console.log(scanprovider.getBaseUrl());
//
//   const module = "account";
//   const params = {
//       action: "txlist",
//       address: account,
//       startblock: 0,
//       endblock: 99999999,
//       sort: "asc",
//   };
//
//   const history = await scanprovider.fetch(module, params);
//
//   console.log(history);
//   return history.map(tx => ({
//     hash: tx.hash,
//     receiver: tx.to,
//     value: tx.value,
//     timestamp: tx.timeStamp,
//     block: tx.blockNumber,
//     gas: tx.cumulativeGasUsed
//   }));
// };

const localProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const connectWalletMetamask = async (accountChangedHandler) => {
    if (window.ethereum) {
        try {
            await provider.send("eth_requestAccounts", []);

            const signer = await provider.getSigner();
            if (signer) {
                accountChangedHandler(signer);

                window.ethereum.on("accountsChanged", async (accounts) => {
                    if (accounts.length > 0) {
                        const newSigner = await provider.getSigner();
                        accountChangedHandler(newSigner);
                    } else {
                        console.log("User disconnected their wallet");
                    }
                });
            }
        } catch (err) {
            console.error("Error connecting to wallet:", err);
        }
    } else {
        console.error("Metamask (Ethereum provider) not found");
    }
};

const fetchTransactions = async (account) => {
    console.log("Fetching transactions for account:", account);

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const latestBlock = await provider.getBlockNumber();

    const transactions = [];

    for (let i = 0; i <= latestBlock; i++) {
        const block = await provider.getBlockWithTransactions(i);

        block.transactions.forEach((tx) => {
            if (tx.from === account || tx.to === account) {
                transactions.push({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: ethers.formatEther(tx.value),
                    gasUsed: tx.gasLimit.toString(),
                    blockNumber: tx.blockNumber,
                });
            }
        });
    }

    console.log(transactions);
    return transactions;
};

const initializeContract = (contractAddress, contractABI) => {
    return new ethers.Contract(contractAddress, contractABI, provider);
};


// const fetchProposals = async (votingContract) => {
//   const eventFilter = votingContract.filters.ProposalAdded();
//   const fromBlock = 0;
//   const toBlock = 'latest';
//
//   const events = await votingContract.queryFilter(eventFilter,
//          fromBlock, toBlock);
//
//          console.log(events);
//      return events.map(event => ({
//            proposer: event.args.proposer,
//            participant1: event.args.participant1,
//            participant2: event.args.participant2,
//            teamName: event.args.teamName
//          }));
// };

const fetchProducts = async (productSystemContract) => {
    const eventFilter = productSystemContract.filters.ProductAdded();
    const fromBlock = 0;
    const toBlock = 'latest';

    const events = await productSystemContract.queryFilter(eventFilter,
        fromBlock, toBlock);

    console.log(events);
    return events.map(event => ({
        productId: event.args.productId,
        productName: event.args.productName,
        productSeller: event.args.seller,
        productPrice: event.args.productPrice,
        productQuantity: event.args.productQuantity
    }));
};

const fetchProductsBought = async (productPlatformContract) => {
    const eventFilter = productPlatformContract.filters.ProductBought();
    const fromBlock = 0;
    const toBlock = 'latest';

    const events = await productPlatformContract.queryFilter(eventFilter,
        fromBlock, toBlock);

    console.log(events);
    return events.map(event => ({
        productId: event.args.productId,
        buyer: event.args.buyer,
        quantity: event.args.quantity,
        seller: event.args.seller
    }));
};

const fetchProductsOutOfStock = async (productSystemContract) => {
    const eventFilter = productSystemContract.filters.ProductOutOfStock();
    const fromBlock = 0;
    const toBlock = 'latest';

    const events = await productSystemContract.queryFilter(eventFilter,
        fromBlock, toBlock);

    console.log(events);
    return events.map(event => ({
        productId: event.args.productId,
    }));
};

const fetchFeedbacksSubmitted = async (reputationSystemContract) => {
    const eventFilter = reputationSystemContract.filters.FeedbackSubmitted();
    const fromBlock = 0;
    const toBlock = 'latest';

    const events = await reputationSystemContract.queryFilter(eventFilter,
        fromBlock, toBlock);

    console.log(events);
    return events.map(event => ({
        productId: event.args.productId,
        reviewer: event.args.reviewer,
        rating: event.args.rating,
        comments: event.args.comments
    }));
};



module.exports = {
    provider,
    connectWalletMetamask,
    fetchTransactions,
    initializeContract,
    fetchProducts,
    fetchProductsBought,
    fetchProductsOutOfStock,
    fetchFeedbacksSubmitted
};


