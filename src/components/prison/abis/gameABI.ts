export const gameABI = [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "nftPlayerAddress_1",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "ActiveAdventureFailed",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "StartGame",
            "inputs": [
                {
                    "name": "_collection",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_nftPrizeAddress",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_nftPrizeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_gameCost",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_wormLvl",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "pathway",
                    "type": "bool[17]",
                    "internalType": "bool[17]"
                },
                {
                    "name": "_escapeFromBasementPrison",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "choice",
            "inputs": [
                {
                    "name": "_nft",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_location",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "_collection",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_choice",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "escapeChoice",
            "inputs": [
                {
                    "name": "_nft",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_location",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "_collection",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getAmountOfRegisteredUsers",
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
            "name": "getCost",
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
            "name": "getDeadNftsLength",
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
            "name": "getGamePausedStatus",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getGameStatus",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMinglesForRaffle",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple[]",
                    "internalType": "struct NftGame.User[]",
                    "components": [
                        {
                            "name": "nftId",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "status",
                            "type": "uint8",
                            "internalType": "enum NftGame.GameState"
                        },
                        {
                            "name": "location",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "wormLvl",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "stage",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "revive",
                            "type": "bool",
                            "internalType": "bool"
                        },
                        {
                            "name": "collection",
                            "type": "address",
                            "internalType": "address"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMinglesForRaffleLength",
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
            "name": "getNftsForFinalBattleLength",
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
            "name": "getOwner",
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
            "name": "getPathway",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bool[17]",
                    "internalType": "bool[17]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getPlayingNFTsAddress1",
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
            "name": "getPlayingNFTsAddress2",
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
            "name": "getPrizeInfo",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                },
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
            "name": "getRegisteredUsersCollection",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple[]",
                    "internalType": "struct NftGame.User[]",
                    "components": [
                        {
                            "name": "nftId",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "status",
                            "type": "uint8",
                            "internalType": "enum NftGame.GameState"
                        },
                        {
                            "name": "location",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "wormLvl",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "stage",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "revive",
                            "type": "bool",
                            "internalType": "bool"
                        },
                        {
                            "name": "collection",
                            "type": "address",
                            "internalType": "address"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getUser",
            "inputs": [
                {
                    "name": "_nft",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_collection",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct NftGame.User",
                    "components": [
                        {
                            "name": "nftId",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "status",
                            "type": "uint8",
                            "internalType": "enum NftGame.GameState"
                        },
                        {
                            "name": "location",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "wormLvl",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "stage",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "revive",
                            "type": "bool",
                            "internalType": "bool"
                        },
                        {
                            "name": "collection",
                            "type": "address",
                            "internalType": "address"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "modifyPathway",
            "inputs": [
                {
                    "name": "_newPath",
                    "type": "bool[17]",
                    "internalType": "bool[17]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
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
            "name": "pauseGame",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "registerOrContinue",
            "inputs": [
                {
                    "name": "_nft",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_location",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "_collection",
                    "type": "address",
                    "internalType": "address"
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
            "name": "resetGame",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "selectWinner",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
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
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "FailedAdventure",
            "inputs": [],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "GameEnded",
            "inputs": [
                {
                    "name": "usersInRound",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "timeStamp",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "GameStarted",
            "inputs": [
                {
                    "name": "startingTime",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "MayahuelRevivedYou",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NFTPrizeSet",
            "inputs": [
                {
                    "name": "nftAddress",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                },
                {
                    "name": "nftId",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NFTsSetForPlay",
            "inputs": [
                {
                    "name": "nftPlayerAddress_1",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                },
                {
                    "name": "nftPlayerAddress_2",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
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
            "name": "Survivors",
            "inputs": [
                {
                    "name": "users",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "WinnerSelected",
            "inputs": [
                {
                    "name": "winner",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "collection",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "NftGame__AlreadyASurvivor",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__GameHasNotStarted",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__GameHasStarted",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__GameIsPaused",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__GameMustBePaused",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__IncorrectAmount",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__MingleCannotRevive",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__MingleNotOwned",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NextRoundNotAvailable",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NftIdRegistered",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NftIsDead",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NftNotOwned",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NftPrizeSet",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NoBalanceInContract",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NoExternalContractInteractionAllowed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NoNFTsPlayersAddress",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NoNftPrizeSet",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NoSurvivors",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NoUsersRegistered",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NotASurvivor",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__NotOwner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__WrongChoiceInput",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NftGame__WrongCollection",
            "inputs": []
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
        }
    ]