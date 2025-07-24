import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Recipe, RecipeInput } from '@/types/recipe';
import { readContract, writeContract } from '@wagmi/core';
import { config } from '@/provider';
import RecipeBook from "./../../smartcontract/artifacts/contracts/RecipeBook.sol/RecipeBook.json";
import { RECIPE_BOOK_ADDRESS } from '@/constants';

interface RecipeStore {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  getRecipe: (id: string) => Promise<void>;
  addRecipe: (recipe: RecipeInput, account: `0x${string}`, chain: any) => Promise<string>;
  vote: (recipeId: string, account: `0x${string}`, chain: any) => Promise<void>;
}

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

export const useRecipeStore = create<RecipeStore>()(
  devtools(
    (set, get) => ({
      recipes: [],
      selectedRecipe: null,
      isLoading: false,
      error: null,

      fetchRecipes: async () => {
        try {
          set({ isLoading: true, error: null });
          const contractRecipes = await readContract(config, {
            abi: RecipeBook.abi,
            address: RECIPE_BOOK_ADDRESS,
            functionName: 'getAllRecipes',
          });
          const recipes = (contractRecipes as any[]).map(parseRecipe);
          set({ recipes, isLoading: false });
        } catch (error) {
          console.error('Error fetching recipes:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch recipes',
            isLoading: false,
          });
        }
      },

      getRecipe: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const contractRecipe = await readContract(config, {
            abi: RecipeBook.abi,
            address: RECIPE_BOOK_ADDRESS,
            functionName: 'getRecipe',
            args: [id],
          });
          const recipe = parseRecipe(contractRecipe);
          set({ selectedRecipe: recipe, isLoading: false });
        } catch (error) {
          console.error('Error fetching recipe:', error);
          set({
            error: error instanceof Error ? error.message : `Failed to fetch recipe ${id}`,
            isLoading: false,
          });
        }
      },

      addRecipe: async (recipeData: RecipeInput, account: `0x${string}`, chain: any) => {
        try {
          set({ isLoading: true, error: null });
          const recipeId = await writeContract(config, {
            abi: RecipeBook.abi,
            address: RECIPE_BOOK_ADDRESS,
            functionName: 'submitRecipe',
            args: [
                recipeData.title,
                JSON.stringify(recipeData.ingredients),
                JSON.stringify(recipeData.instructions),
                recipeData.imageURL
            ],
            account,
            chain,
          });
          await get().fetchRecipes();
          set({ isLoading: false });
          return recipeId.toString();
        } catch (error) {
          console.error('Error adding recipe:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to add recipe',
            isLoading: false,
          });
          throw error;
        }
      },

      vote: async (recipeId: string, account: `0x${string}`, chain: any) => {
        try {
          set({ error: null });
          await writeContract(config, {
            abi: RecipeBook.abi,
            address: RECIPE_BOOK_ADDRESS,
            functionName: 'voteRecipe',
            args: [recipeId],
            account,
            chain,
          });
          await get().fetchRecipes();
        } catch (error) {
          console.error('Error voting recipe:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to vote for recipe',
          });
          throw error;
        }
      },
    }),
    { name: 'recipe-store' }
  )
);