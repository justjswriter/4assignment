let web3;
let userWallet;
let tokenContract;
let aiModels = [];

const tokenAddress = "0x5ff9B26554A15c026ebc5a68535894226771C54F"; // Your ERC-20 token address
const tokenABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_initialSupply",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);

    // Connect wallet button event
    document.getElementById("connectWalletButton").onclick = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userWallet = accounts[0];
            document.getElementById("walletAddress").innerText = `Wallet: ${userWallet}`;
            initializeTokenContract();
            await getTokenBalance(); // Fetch balance after wallet connects
        } catch (err) {
            alert("Error connecting to wallet: " + err);
        }
    };
} else {
    alert("Please install MetaMask!");
}

// Function to initialize the token contract
const initializeTokenContract = () => {
    console.log("Initializing contract...");
    tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
    console.log("Contract initialized:", tokenContract);
};

// Fetch and display the user's token balance
const getTokenBalance = async () => {
    if (!userWallet) {
        console.log("No wallet connected");
        return;
    }
    try {
        console.log("Fetching balance for wallet:", userWallet);
        const balance = await tokenContract.methods.balanceOf(userWallet).call();
        console.log("Balance fetched:", balance);

        // Convert the balance from wei to ether (assuming the token has 18 decimals)
        const balanceInTokens = web3.utils.fromWei(balance, 'ether');
        console.log("Balance in tokens:", balanceInTokens);

        document.getElementById('tokenBalance').innerText = balanceInTokens;
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
};

// Event listener to refresh balance
document.getElementById('refreshBalanceButton').onclick = async () => {
    if (userWallet) {
        await getTokenBalance();
    } else {
        alert("Please connect your wallet first.");
    }
};

// Display AI Models
const displayModels = () => {
    const aiModelsListElement = document.getElementById('aiModelsList');
    aiModelsListElement.innerHTML = ""; // Clear existing models

    aiModels.forEach(model => {
        const modelElement = document.createElement('div');
        modelElement.classList.add('model-card');
        modelElement.innerHTML = `
            <h3>${model.name}</h3>
            <p>${model.description}</p>
            <p>Price: ${model.price} ERC-20 tokens</p>
            <p>Seller: ${model.seller}</p>
            <button onclick="buyModel('${model.name}', ${model.price}, '${model.seller}')">Buy</button>
        `;
        aiModelsListElement.appendChild(modelElement);
    });
};

// Function to handle buying AI models
const buyModel = async (modelName, price, seller) => {
    if (!userWallet) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
        // Transfer ERC-20 tokens from the buyer to the seller
        await tokenContract.methods.transfer(seller, price).send({ from: userWallet });

        // Notify the user about successful purchase
        alert(`Purchase of ${modelName} was successful!`);

        // Optionally remove the model from the list (mark as sold)
        aiModels = aiModels.filter(m => m.name !== modelName);
        displayModels();

        // Refresh the token balance after the purchase
        await getTokenBalance();

    } catch (error) {
        alert("Error during purchase: " + error);
    }
};


// Form submission to add new AI model
document.getElementById('addModelForm').onsubmit = async (e) => {
    e.preventDefault();

    const modelName = document.getElementById('modelName').value;
    const modelDescription = document.getElementById('modelDescription').value;
    const modelPrice = document.getElementById('modelPrice').value;
    const modelFile = document.getElementById('modelFile').files[0];

    // Simulate uploading the model to IPFS (or use any service for actual file storage)
    const modelFileUrl = await uploadToIPFS(modelFile);  // Implement uploadToIPFS as per your choice of service

    // Add the new model to the AI models list
    aiModels.push({
        name: modelName,
        description: modelDescription,
        price: modelPrice,
        seller: userWallet, // The seller is the user connected to the wallet
        fileUrl: modelFileUrl
    });

    // Refresh the displayed models
    displayModels();
};

// Example upload function (using a mock URL or IPFS service)
const uploadToIPFS = async (file) => {
    // Implement file upload to IPFS service (e.g., Pinata or Infura)
    // Here, we're just mocking the process by returning a dummy URL
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("https://ipfs.io/ipfs/your_file_hash_here");
        }, 1000);
    });
};

// On page load, if the wallet is already connected, display models
if (userWallet) {
    displayModels();
}