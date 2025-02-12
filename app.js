
let web3;
let userWallet;
let tokenContract;
let aiModels = [];

const tokenAddress = "0x544C635d195C2b734B891b1c5a9C598997ab087b";
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

    document.getElementById("connectWalletButton").onclick = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userWallet = accounts[0];
            document.getElementById("walletAddress").innerText = `Wallet: ${userWallet}`;
            initializeTokenContract();
            await getTokenBalance();
            listenForTransfers();
        } catch (err) {
            alert("Error connecting to wallet: " + err);
        }
    };

    window.addEventListener("load", async () => {
        if (window.ethereum.selectedAddress) {
            userWallet = window.ethereum.selectedAddress;
            document.getElementById("walletAddress").innerText = `Wallet: ${userWallet}`;
            initializeTokenContract();
            await getTokenBalance();
            listenForTransfers();
        }
    });
} else {
    alert("Please install MetaMask!");
}

const initializeTokenContract = () => {
    tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
};

const getTokenBalance = async () => {
    if (!userWallet) return;
    try {
        console.log("🔄 Fetching latest balance...");
        const balance = await tokenContract.methods.balanceOf(userWallet).call();
        const balanceInTokens = web3.utils.fromWei(balance, 'ether');
        console.log("💰 Updated Balance:", balanceInTokens);
        document.getElementById('tokenBalance').innerText = balanceInTokens;
    } catch (error) {
        console.error("❌ Error fetching balance:", error);
    }
};

const listenForTransfers = () => {
    if (!tokenContract || !userWallet) return;

    console.log("🔔 Listening for Transfer events...");

    tokenContract.events.Transfer()
        .on("data", async (event) => {
            if (event.returnValues.to.toLowerCase() === userWallet.toLowerCase() ||
                event.returnValues.from.toLowerCase() === userWallet.toLowerCase()) {
                console.log("🔔 Transfer detected! Fetching updated balance...");
                await getTokenBalance();
            }
        })
        .on("error", (error) => console.error("❌ Event error:", error));
};

document.getElementById('refreshBalanceButton').onclick = async () => {
    if (userWallet) {
        await getTokenBalance();
    } else {
        alert("Please connect your wallet first.");
    }
};

const displayModels = () => {
    const aiModelsListElement = document.getElementById('aiModelsList');
    aiModelsListElement.innerHTML = "";

    aiModels.forEach(model => {
        const modelElement = document.createElement('div');
        modelElement.classList.add('model-card');
        modelElement.innerHTML = `
            <h3>${model.name}</h3>
            <p>${model.description}</p>
            <p>Price: ${model.price} MTK</p>
            <p>Seller: ${model.seller}</p>
            <button onclick="buyModel('${model.name}', '${model.price}', '${model.seller}')">Buy</button>
        `;
        aiModelsListElement.appendChild(modelElement);
    });
};

const buyModel = async (modelName, price, seller) => {
    if (!userWallet) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
        const priceInWei = web3.utils.toWei(price.toString(), "ether");
        console.log(`💰 Buying ${modelName} for ${price} MTK (Wei: ${priceInWei})`);

        const receipt = await tokenContract.methods.transfer(seller, priceInWei).send({ from: userWallet });
        console.log("✅ Purchase successful!", receipt);

        alert(`✅ Purchase of ${modelName} successful!`);
        aiModels = aiModels.filter(m => m.name !== modelName);
        displayModels();

        console.log("⏳ Waiting 5 seconds before refreshing balance...");
        setTimeout(async () => {
            console.log("🔄 Manually fetching balance...");
            await getTokenBalance();
        }, 5000);
    } catch (error) {
        alert("❌ Error during purchase: " + error.message);
    }
};

document.getElementById('addModelForm').onsubmit = async (e) => {
    e.preventDefault();
    aiModels.push({
        name: document.getElementById('modelName').value,
        description: document.getElementById('modelDescription').value,
        price: document.getElementById('modelPrice').value,
        seller: userWallet
    });
    displayModels();
};

if (userWallet) {
    displayModels();
