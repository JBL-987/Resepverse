import { Recipe } from "@/types/recipe";
import { readContract, writeContract } from '@wagmi/core';
import { config } from '@/provider';
import { RECIPE_BOOK_ADDRESS } from '@/constants';
import RecipeBook from "../../smartcontract/artifacts/contracts/RecipeBook.sol/RecipeBook.json";

/**
 * Parses a recipe from the smart contract format to the frontend format
 */
function parseRecipe(contractRecipe: any): Recipe {
  return {
    id: contractRecipe.id.toString(),
    creator: contractRecipe.creator,
    title: contractRecipe.title,
    ingredients: JSON.parse(contractRecipe.ingredients || "[]"),
    instructions: JSON.parse(contractRecipe.instructions || "[]"),
    imageURL: contractRecipe.imageURL,
    votes: Number(contractRecipe.votes),
    timestamp: new Date(Number(contractRecipe.timestamp) * 1000).toISOString(),
  };
}

/**
 * Fetches all recipes from the blockchain
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const totalRecipes = await readContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'getTotalRecipes',
    }) as bigint;

    const recipes: Recipe[] = [];
    const total = Number(totalRecipes);

    // Fetch each recipe individually
    for (let i = 1; i <= total; i++) {
      try {
        const contractRecipe = await readContract(config, {
          abi: RecipeBook.abi,
          address: RECIPE_BOOK_ADDRESS,
          functionName: 'recipes',
          args: [i],
        });
        
        if (contractRecipe && (contractRecipe as any).id !== 0) {
          recipes.push(parseRecipe(contractRecipe));
        }
      } catch (error) {
        console.error(`Error fetching recipe ${i}:`, error);
      }
    }

    return recipes;
  } catch (error) {
    console.error('Error fetching all recipes:', error);
    return [];
  }
}

/**
 * Fetches a single recipe by ID
 */
export async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const contractRecipe = await readContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'recipes',
      args: [id],
    });

    if (contractRecipe && (contractRecipe as any).id !== 0) {
      return parseRecipe(contractRecipe);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    return null;
  }
}

/**
 * Submits a new recipe to the blockchain
 */
export async function submitRecipe(
  data: Omit<Recipe, "id" | "creator" | "votes" | "timestamp">,
  account: `0x${string}`,
  chain: any
): Promise<string> {
  try {
    const result = await writeContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'submitRecipe',
      args: [
        data.title,
        JSON.stringify(data.ingredients),
        JSON.stringify(data.instructions),
        data.imageURL
      ],
      account,
      chain,
    });

    return result.toString();
  } catch (error) {
    console.error('Error submitting recipe:', error);
    throw error;
  }
}

/**
 * Votes for a recipe on the blockchain
 */
export async function voteRecipe(
  id: string,
  account: `0x${string}`,
  chain: any
): Promise<void> {
  try {
    await writeContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'voteRecipe',
      args: [id],
      account,
      chain,
    });
  } catch (error) {
    console.error('Error voting for recipe:', error);
    throw error;
  }
}

/**
 * Checks if a user has already voted for a recipe
 */
export async function hasUserVoted(recipeId: string, userAddress: string): Promise<boolean> {
  try {
    const hasVoted = await readContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'hasVoted',
      args: [recipeId, userAddress],
    });
    return hasVoted as boolean;
  } catch (error) {
    console.error('Error checking if user has voted:', error);
    return false;
  }
}

/**
 * Gets user reputation from the blockchain
 */
export async function getUserReputation(userAddress: string): Promise<number> {
  try {
    const reputation = await readContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'userReputation',
      args: [userAddress],
    });
    return Number(reputation);
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    return 0;
  }
}