export const resepverseABI = [
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_ingredients", type: "string" },
      { internalType: "string", name: "_instructions", type: "string" },
      { internalType: "string", name: "_imageURL", type: "string" },
    ],
    name: "submitRecipe",
    outputs: [{ internalType: "uint256", name: "recipeId", type: "uint256" }],
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
        ],
        internalType: "struct ResepVerse.Recipe[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_recipeId", type: "uint256" }],
    name: "hasUserVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserReputation",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
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
] as const;
