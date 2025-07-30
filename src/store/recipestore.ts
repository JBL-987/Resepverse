import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Recipe, RecipeInput } from '@/types/recipe';
import { getAllRecipes, getRecipe, submitRecipe, voteRecipe } from '@/lib/liskClient';

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
          const recipes = await getAllRecipes();
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
          const recipe = await getRecipe(id);
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
          const recipeId = await submitRecipe(recipeData, account, chain);
          await get().fetchRecipes();
          set({ isLoading: false });
          return recipeId;
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
          await voteRecipe(recipeId, account, chain);
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