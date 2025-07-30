export const resepverseABI = [
  {
    inputs: [],
    name: "createUserProfile",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "completeOnboarding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bool", name: "_agentEnabled", type: "bool" },
      { internalType: "bool", name: "_notifications", type: "bool" },
      { internalType: "uint8", name: "_theme", type: "uint8" }
    ],
    name: "updateUserPreferences",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserProfile",
    outputs: [
      {
        components: [
          { internalType: "address", name: "userAddress", type: "address" },
          { internalType: "uint256", name: "reputation", type: "uint256" },
          { internalType: "uint256", name: "recipesCreated", type: "uint256" },
          { internalType: "uint256", name: "votesReceived", type: "uint256" },
          { internalType: "bool", name: "isOnboarded", type: "bool" },
          { internalType: "bool", name: "agentEnabled", type: "bool" },
          { internalType: "bool", name: "notifications", type: "bool" },
          { internalType: "uint8", name: "theme", type: "uint8" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" }
        ],
        internalType: "struct RecipeBook.UserProfile",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "doesUserExist",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  // Recipe Functions
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_ingredients", type: "string" },
      { internalType: "string", name: "_instructions", type: "string" },
      { internalType: "string", name: "_imageURL", type: "string" },
    ],
    name: "submitRecipe",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_recipeId", type: "uint256" }],
    name: "voteRecipe",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllRecipes",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "ingredients", type: "string" },
          { internalType: "string", name: "instructions", type: "string" },
          { internalType: "string", name: "imageURL", type: "string" },
          { internalType: "uint256", name: "votes", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "bool", name: "isNFT", type: "bool" },
          { internalType: "uint256", name: "nftTokenId", type: "uint256" }
        ],
        internalType: "struct RecipeBook.RecipeData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalRecipes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // NFT Functions
  {
    inputs: [
      { internalType: "uint256", name: "_recipeId", type: "uint256" },
      { internalType: "uint256", name: "_mintPrice", type: "uint256" },
      { internalType: "uint256", name: "_royaltyPercent", type: "uint256" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_tokenURI", type: "string" }
    ],
    name: "mintRecipeNFT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
      { internalType: "uint256", name: "_price", type: "uint256" }
    ],
    name: "listNFTForSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tokenId", type: "uint256" }],
    name: "removeNFTFromSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tokenId", type: "uint256" }],
    name: "buyNFT",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getNFTsForSale",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserNFTs",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalNFTs",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // View Functions for voting and reputation
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" }
    ],
    name: "hasVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "userReputation",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Admin Functions
  {
    inputs: [{ internalType: "uint256", name: "_feeBps", type: "uint256" }],
    name: "setPlatformFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_recipient", type: "address" }],
    name: "setFeeRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "UserProfileCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "UserProfileUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "uint256", name: "recipeId", type: "uint256" },
      { indexed: false, internalType: "string", name: "title", type: "string" },
    ],
    name: "RecipeSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "voter", type: "address" },
      { indexed: false, internalType: "uint256", name: "recipeId", type: "uint256" },
    ],
    name: "RecipeVoted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "recipeId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "mintPrice", type: "uint256" }
    ],
    name: "NFTMinted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" }
    ],
    name: "NFTSold",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" }
    ],
    name: "NFTListedForSale",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "NFTRemovedFromSale",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "RoyaltyPaid",
    type: "event",
  }
] as const satisfies readonly unknown[];