export const ton_address = "";

export const ton_curtis_address = "0x2E4A6a5ffEeb7604d6C7697284eEbb86CC22c02d";

export const TON = [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "_nftAddress",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "changeTotalSupply",
            "inputs": [
                {
                    "name": "_newAmount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getApe",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getBalance",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMinglesPrice",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "getNormalPrice",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "getTotalPurchased",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getTotalSupply",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getUser",
            "inputs": [
                {
                    "name": "_user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct TonPurchaseOnApechainRaffle.User",
                    "components": [
                        {
                            "name": "wallet",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "tonWallet",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "purchaseAmount",
                            "type": "uint256",
                            "internalType": "uint256"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getUserForRaffle",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "owner",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "purchaseTonStickerAndEnterRaffle",
            "inputs": [
                {
                    "name": "_tonAddress",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "renounceOwnership",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "transferOwnership",
            "inputs": [
                {
                    "name": "newOwner",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "withdrawBalance",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "event",
            "name": "BalanceWithdrawn",
            "inputs": [
                {
                    "name": "balance",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "OwnershipTransferred",
            "inputs": [
                {
                    "name": "previousOwner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "newOwner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TonStickersPurchasedAndRaffle",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "OwnableInvalidOwner",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                }
            ]
        },
        {
            "type": "error",
            "name": "OwnableUnauthorizedAccount",
            "inputs": [
                {
                    "name": "account",
                    "type": "address",
                    "internalType": "address"
                }
            ]
        },
        {
            "type": "error",
            "name": "ReentrancyGuardReentrantCall",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TonPurchaseOnApechainRaffle__CannotBeLessOrEqualThanTotalPurchased",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TonPurchaseOnApechainRaffle__CannotBeZero",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TonPurchaseOnApechainRaffle__CannotChangeForHigherOrEqualAmount",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TonPurchaseOnApechainRaffle__LimitForPurchasedReached",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TonPurchaseOnApechainRaffle__NoBalanceInContract",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TonPurchaseOnApechainRaffle__NoExternalContractInteractionAllowed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TonPurchaseOnApechainRaffle__NotEnoughApeToPurchase",
            "inputs": []
        }
    ]