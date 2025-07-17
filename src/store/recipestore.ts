// store/recipestore.ts (Updated)
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Recipe, RecipeInput } from '@/types/recipe';
import {
  getAllRecipes,
  submitRecipe,
  voteRecipe,
  connectWallet as connectBlockchainWallet,
  getCurrentAccount,
  getUserReputation,
  subscribeToEvents,
  unsubscribeFromEvents,
  validateNetwork,
  initializeWeb3,
  getRecipe as getRecipeFromBlockchain,
} from '@/services/blockchain';

interface RecipeStore {
  // State
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  walletAddress: string | null;
  isConnected: boolean;
  userReputation: number;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  fetchRecipes: () => Promise<void>;
  getRecipe: (id: string) => Promise<void>;
  addRecipe: (recipe: RecipeInput) => Promise<string>;
  vote: (recipeId: string) => Promise<void>;
  connectWallet: (address?: string) => Promise<string>;
  disconnectWallet: () => void;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
  
  // Real-time updates
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
  
  // Context integration methods
  setWalletAddress: (address: string | null) => void;
  updateConnectionStatus: (isConnected: boolean) => void;
  
  // Additional methods for AuthContext integration
  logout: () => void;
}

export const useRecipeStore = create<RecipeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        recipes: [],
        selectedRecipe: null,
        isLoading: false,
        error: null,
        walletAddress: null,
        isConnected: false,
        userReputation: 0,
        isInitialized: false,
        
        // Initialize Web3 and check existing connection
        initialize: async () => {
          try {
            await initializeWeb3();
            const currentAccount = await getCurrentAccount();
            
            if (currentAccount) {
              set({ 
                walletAddress: currentAccount,
                isConnected: true,
                isInitialized: true
              });
              
              // Auto-fetch recipes and user data
              await get().fetchRecipes();
              await get().refreshUserData();
              get().subscribeToUpdates();
            } else {
              set({ isInitialized: true });
            }
          } catch (error) {
            console.error('Error initializing store:', error);
            set({ 
              error: 'Failed to initialize blockchain connection',
              isInitialized: true
            });
          }
        },
        
        // Fetch all recipes
        fetchRecipes: async () => {
          try {
            set({ isLoading: true, error: null });
            
            const { walletAddress } = get();
            const recipes = await getAllRecipes(walletAddress || undefined);
            
            set({ recipes, isLoading: false });
          } catch (error) {
            console.error('Error fetching recipes:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch recipes',
              isLoading: false 
            });
          }
        },

        // Get single recipe
        getRecipe: async (id: string) => {
          try {
            set({ isLoading: true, error: null });
            const recipe = await getRecipeFromBlockchain(id);
            set({ selectedRecipe: recipe, isLoading: false });
          } catch (error) {
            console.error('Error fetching recipe:', error);
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch recipe',
              isLoading: false
            });
          }
        },
        
        // Add new recipe
        addRecipe: async (recipeData: RecipeInput) => {
          try {
            set({ isLoading: true, error: null });
            
            const { walletAddress, isConnected } = get();
            if (!walletAddress || !isConnected) {
              throw new Error('Please connect your wallet first');
            }
            
            // Validate network
            const isValidNetwork = await validateNetwork();
            if (!isValidNetwork) {
              throw new Error('Please switch to the correct network');
            }
            
            const recipeId = await submitRecipe(recipeData);
            
            // Refresh recipes after successful submission
            await get().fetchRecipes();
            
            set({ isLoading: false });
            return recipeId;
            
          } catch (error) {
            console.error('Error adding recipe:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to add recipe',
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Vote for recipe
        vote: async (recipeId: string) => {
          try {
            set({ error: null });
            
            const { walletAddress, isConnected } = get();
            if (!walletAddress || !isConnected) {
              throw new Error('Please connect your wallet first');
            }
            
            await voteRecipe(recipeId);
            
            // Update recipe in local state optimistically
            set(state => ({
              recipes: state.recipes.map(recipe => 
                recipe.id === recipeId 
                  ? { ...recipe, votes: recipe.votes + 1, hasVoted: true }
                  : recipe
              )
            }));
            
            // Refresh user reputation
            await get().refreshUserData();
            
          } catch (error) {
            console.error('Error voting recipe:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to vote for recipe'
            });
            
            // Revert optimistic update on error
            await get().fetchRecipes();
            throw error;
          }
        },
        
        // Connect wallet (updated to accept address parameter)
        connectWallet: async (address?: string) => {
          try {
            set({ isLoading: true, error: null });
            
            // If address is provided (from context), use it directly
            let walletAddress = address;
            
            // If no address provided, connect via blockchain
            if (!walletAddress) {
              walletAddress = await connectBlockchainWallet();
            }
            
            set({ 
              walletAddress,
              isConnected: true,
              isLoading: false
            });
            
            // Fetch user data and recipes
            await get().refreshUserData();
            await get().fetchRecipes();
            
            // Subscribe to real-time updates
            get().subscribeToUpdates();
            
            return walletAddress;
            
          } catch (error) {
            console.error('Error connecting wallet:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to connect wallet',
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Disconnect wallet (updated with better cleanup)
        disconnectWallet: () => {
          get().unsubscribeFromUpdates();
          
          set({
            walletAddress: null,
            isConnected: false,
            userReputation: 0,
            recipes: [],
            error: null
          });
        },
        
        // Logout (alias for disconnectWallet)
        logout: () => {
          get().disconnectWallet();
        },
        
        // Set wallet address (called from context)
        setWalletAddress: (address: string | null) => {
          set({ walletAddress: address });
          
          if (address) {
            // Auto-fetch data when address is set
            get().fetchRecipes();
            get().refreshUserData();
            get().subscribeToUpdates();
          } else {
            // Clear data when address is removed
            get().unsubscribeFromUpdates();
            set({ 
              recipes: [],
              userReputation: 0,
              error: null
            });
          }
        },
        
        // Update connection status (called from context)
        updateConnectionStatus: (isConnected: boolean) => {
          set({ isConnected });
          
          if (!isConnected) {
            get().unsubscribeFromUpdates();
            set({ 
              userReputation: 0,
              recipes: [],
              error: null
            });
          }
        },
        
        // Refresh user data
        refreshUserData: async () => {
          try {
            const { walletAddress } = get();
            if (!walletAddress) return;
            
            const reputation = await getUserReputation(walletAddress);
            set({ userReputation: reputation });
            
          } catch (error) {
            console.error('Error refreshing user data:', error);
            // Don't set error state for background refresh failures
          }
        },
        
        // Clear error
        clearError: () => set({ error: null }),
        
        // Subscribe to real-time events
        subscribeToUpdates: () => {
          const { walletAddress } = get();
          if (!walletAddress) return;
          
          subscribeToEvents(
            // onRecipeSubmitted
            (creator, recipeId, title) => {
              console.log('New recipe submitted:', { creator, recipeId, title });
              // Refresh recipes to show new submission
              get().fetchRecipes();
            },
            // onRecipeVoted
            (voter, recipeId) => {
              console.log('Recipe voted:', { voter, recipeId });
              // Refresh recipes to show updated vote count
              get().fetchRecipes();
              
              // Refresh user reputation if current user voted
              if (voter === walletAddress) {
                get().refreshUserData();
              }
            }
          );
        },
        
        // Unsubscribe from events
        unsubscribeFromUpdates: () => {
          unsubscribeFromEvents();
        }
      }),
      {
        name: 'recipe-store',
        // Only persist non-sensitive data
        partialize: (state) => ({
          userReputation: state.userReputation,
          // Don't persist recipes, wallet address, etc. for security
        }),
      }
    ),
    { name: 'recipe-store' }
  )
);

// Selectors for easier access
export const useRecipes = () => useRecipeStore(state => state.recipes);
export const useRecipeLoading = () => useRecipeStore(state => state.isLoading);
export const useRecipeError = () => useRecipeStore(state => state.error);
export const useWalletAddress = () => useRecipeStore(state => state.walletAddress);
export const useIsConnected = () => useRecipeStore(state => state.isConnected);
export const useUserReputation = () => useRecipeStore(state => state.userReputation);
export const useIsInitialized = () => useRecipeStore(state => state.isInitialized);

// Initialize store on app start
export const initializeRecipeStore = async () => {
  try {
    await useRecipeStore.getState().initialize();
  } catch (error) {
    console.error('Error initializing recipe store:', error);
  }
};