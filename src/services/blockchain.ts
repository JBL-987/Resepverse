// services/blockchain.ts
import { Recipe, RecipeInput } from "@/types/recipe";
import { resepverseABI } from "@/utils/abi";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x...";
const LISK_RPC_URL = "https://rpc.api.lisk.com"; 

let provider: ethers.BrowserProvider | null = null;
let contract: ethers.Contract | null = null;

// Initialize provider dan contract
export async function initializeWeb3(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, resepverseABI, signer);
  } else {
    throw new Error("MetaMask not installed");
  }
}

// Connect wallet
export async function connectWallet(): Promise<string> {
  if (!provider) await initializeWeb3();
  
  const accounts = await provider!.send("eth_requestAccounts", []);
  return accounts[0];
}

// Helper function untuk mengconvert data dari contract
function convertContractRecipe(contractRecipe: any, userAddress?: string): Recipe {
  return {
    id: contractRecipe.id.toString(),
    creator: contractRecipe.creator,
    title: contractRecipe.title,
    ingredients: JSON.parse(contractRecipe.ingredients || "[]"),
    instructions: JSON.parse(contractRecipe.instructions || "[]"),
    imageURL: contractRecipe.imageURL,
    votes: Number(contractRecipe.votes),
    timestamp: new Date(Number(contractRecipe.timestamp) * 1000).toISOString(),
    hasVoted: false // akan diupdate di getAllRecipes
  };
}

// Get all recipes from blockchain
export async function getAllRecipes(userAddress?: string): Promise<Recipe[]> {
  try {
    if (!contract) await initializeWeb3();
    
    const contractRecipes = await contract!.getAllRecipes();
    const recipes: Recipe[] = [];
    
    for (const contractRecipe of contractRecipes) {
      const recipe = convertContractRecipe(contractRecipe, userAddress);
      
      // Check if user has voted (if userAddress provided)
      if (userAddress) {
        try {
          const hasVoted = await contract!.hasUserVoted(recipe.id, userAddress);
          recipe.hasVoted = hasVoted;
        } catch (error) {
          console.warn("Error checking vote status:", error);
          recipe.hasVoted = false;
        }
      }
      
      recipes.push(recipe);
    }
    
    // Sort by timestamp (newest first)
    return recipes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw new Error("Failed to fetch recipes from blockchain");
  }
}

// Submit new recipe to blockchain
export async function submitRecipe(recipeData: RecipeInput): Promise<string> {
  try {
    if (!contract) await initializeWeb3();
    
    // Convert arrays to JSON strings
    const ingredientsJson = JSON.stringify(recipeData.ingredients);
    const instructionsJson = JSON.stringify(recipeData.instructions);
    
    // Call contract function
    const tx = await contract!.submitRecipe(
      recipeData.title,
      ingredientsJson,
      instructionsJson,
      recipeData.imageURL
    );
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    // Get recipe ID from transaction receipt
    const recipeId = receipt.logs[0]?.args?.recipeId?.toString() || "0";
    
    return recipeId;
    
  } catch (error) {
    console.error("Error submitting recipe:", error);
    throw new Error("Failed to submit recipe to blockchain");
  }
}

// Vote for a recipe
export async function voteRecipe(recipeId: string): Promise<void> {
  try {
    if (!contract) await initializeWeb3();
    
    const tx = await contract!.voteRecipe(recipeId);
    await tx.wait();
    
  } catch (error) {
    console.error("Error voting recipe:", error);
    
    // Handle specific error cases
    if (error.message.includes("Already voted")) {
      throw new Error("You have already voted for this recipe");
    } else if (error.message.includes("Invalid recipe id")) {
      throw new Error("Recipe not found");
    } else {
      throw new Error("Failed to vote for recipe");
    }
  }
}

// Get user reputation
export async function getUserReputation(userAddress: string): Promise<number> {
  try {
    if (!contract) await initializeWeb3();
    
    const reputation = await contract!.getUserReputation(userAddress);
    return Number(reputation);
    
  } catch (error) {
    console.error("Error getting user reputation:", error);
    return 0;
  }
}

// Get single recipe by ID
export async function getRecipe(recipeId: string): Promise<Recipe | null> {
  try {
    if (!contract) await initializeWeb3();
    
    const contractRecipe = await contract!.getRecipe(recipeId);
    return convertContractRecipe(contractRecipe);
    
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

// Listen to events
export function subscribeToEvents(
  onRecipeSubmitted?: (creator: string, recipeId: string, title: string) => void,
  onRecipeVoted?: (voter: string, recipeId: string) => void
): void {
  if (!contract) return;
  
  if (onRecipeSubmitted) {
    contract.on("RecipeSubmitted", (creator, recipeId, title) => {
      onRecipeSubmitted(creator, recipeId.toString(), title);
    });
  }
  
  if (onRecipeVoted) {
    contract.on("RecipeVoted", (voter, recipeId) => {
      onRecipeVoted(voter, recipeId.toString());
    });
  }
}

// Unsubscribe from events
export function unsubscribeFromEvents(): void {
  if (contract) {
    contract.removeAllListeners();
  }
}

// Utility function untuk format address
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Check if user is connected
export async function getCurrentAccount(): Promise<string | null> {
  try {
    if (!provider) return null;
    
    const accounts = await provider.listAccounts();
    return accounts.length > 0 ? accounts[0].address : null;
    
  } catch (error) {
    console.error("Error getting current account:", error);
    return null;
  }
}

// Network validation (optional)
export async function validateNetwork(): Promise<boolean> {
  try {
    if (!provider) return false;
    
    const network = await provider.getNetwork();
    // Ganti dengan chain ID yang sesuai untuk Lisk
    const expectedChainId = 1135; // Lisk mainnet chain ID
    
    return network.chainId === BigInt(expectedChainId);
    
  } catch (error) {
    console.error("Error validating network:", error);
    return false;
  }
}