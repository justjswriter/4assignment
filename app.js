
let web3;
let userWallet;
let tokenContract;
let aiModels = [];
let boughtModels = [];

const tokenAddress = "0x25dFd02E7fd0CA06d67bf3C53A555cee50E2E818";
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
        const balance = await tokenContract.methods.balanceOf(userWallet).call();
        document.getElementById('tokenBalance').innerText = web3.utils.fromWei(balance, 'ether');
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
};

document.getElementById('refreshBalanceButton').onclick = async () => {
    if (userWallet) {
        await getTokenBalance();
    } else {
        alert("Please connect your wallet first.");
    }
};
const refreshBalanceButton = document.getElementById('refreshBalanceButton');

refreshBalanceButton.onclick = async () => {
    if (!userWallet) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
        console.log("🔄 Fetching latest balance...");
        const balance = await tokenContract.methods.balanceOf(userWallet).call();
        const balanceInTokens = web3.utils.fromWei(balance, 'ether');
        console.log("💰 Updated Balance:", balanceInTokens);
        document.getElementById('tokenBalance').innerText = balanceInTokens;
    } catch (error) {
        console.error("❌ Error fetching balance:", error);
        alert("Error fetching balance! Check console for details.");
    }
};

window.onload = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
        userWallet = window.ethereum.selectedAddress;
        document.getElementById("walletAddress").innerText = `Wallet: ${userWallet}`;
        initializeTokenContract();
        await refreshBalanceButton.onclick();
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
            <p><a href="${model.file}" target="_blank">Download Model</a></p>
            <button onclick="buyModel('${model.name}', '${model.price}', '${model.seller}', '${model.file}')">Buy</button>
        `;
        aiModelsListElement.appendChild(modelElement);
    });
};

const displayBoughtModels = () => {
    const boughtModelsListElement = document.getElementById('boughtModelsList');
    boughtModelsListElement.innerHTML = "";

    boughtModels.forEach(model => {
        const modelElement = document.createElement('div');
        modelElement.classList.add('model-card');
        modelElement.innerHTML = `
            <h3>${model.name}</h3>
            <p>${model.description}</p>
            <p>Price: ${model.price} MTK</p>
            <p>Seller: ${model.seller}</p>
            <p><a href="${model.file}" target="_blank">Download Model</a></p>
        `;
        boughtModelsListElement.appendChild(modelElement);
    });
};

const buyModel = async (modelName, price, seller, file) => {
    if (!userWallet) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
        const priceInWei = web3.utils.toWei(price.toString(), "ether");
        await tokenContract.methods.transfer(seller, priceInWei).send({ from: userWallet });

        alert(`✅ Purchase of ${modelName} successful!`);
        aiModels = aiModels.filter(m => m.name !== modelName);
        boughtModels.push({ name: modelName, price, seller, file });

        displayModels();
        displayBoughtModels();
    } catch (error) {
        alert("❌ Error during purchase: " + error.message);
    }
};

document.getElementById('addModelForm').onsubmit = async (e) => {
    e.preventDefault();
    const file = document.getElementById('modelFile').files[0];
    const fileURL = URL.createObjectURL(file);

    aiModels.push({
        name: document.getElementById('modelName').value,
        description: document.getElementById('modelDescription').value,
        price: document.getElementById('modelPrice').value,
        seller: userWallet,
        file: fileURL
    });

    displayModels();
};
