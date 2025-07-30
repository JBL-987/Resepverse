import { readContract, writeContract } from '@wagmi/core';
import { config } from '@/provider';
import { RECIPE_BOOK_ADDRESS } from '@/constants';
import RecipeBook from "../../smartcontract/artifacts/contracts/RecipeBook.sol/RecipeBook.json";

// User Profile interface matching the smart contract
export interface UserProfile {
  userAddress: string;
  reputation: number;
  recipesCreated: number;
  votesReceived: number;
  isOnboarded: boolean;
  agentEnabled: boolean;
  notifications: boolean;
  theme: number; // 0 = light, 1 = dark
  createdAt: number;
  updatedAt: number;
}

// Frontend UserProfile interface (for compatibility with existing code)
export interface FrontendUserProfile {
  id: string;
  address: string;
  reputation: number;
  recipesCreated: number;
  votesReceived: number;
  isOnboarded: boolean;
  preferences: {
    agentEnabled: boolean;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}

/**
 * Converts blockchain UserProfile to frontend UserProfile format
 */
function convertToFrontendProfile(blockchainProfile: UserProfile): FrontendUserProfile {
  return {
    id: blockchainProfile.userAddress,
    address: blockchainProfile.userAddress,
    reputation: blockchainProfile.reputation,
    recipesCreated: blockchainProfile.recipesCreated,
    votesReceived: blockchainProfile.votesReceived,
    isOnboarded: blockchainProfile.isOnboarded,
    preferences: {
      agentEnabled: blockchainProfile.agentEnabled,
      notifications: blockchainProfile.notifications,
      theme: blockchainProfile.theme === 0 ? 'light' : 'dark'
    }
  };
}

/**
 * Checks if a user profile exists on the blockchain
 */
export async function doesUserExist(address: string): Promise<boolean> {
  try {
    const exists = await readContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'doesUserExist',
      args: [address],
    });
    return exists as boolean;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}

/**
 * Gets user profile from the blockchain
 */
export async function getUserProfile(address: string): Promise<FrontendUserProfile | null> {
  try {
    const exists = await doesUserExist(address);
    if (!exists) {
      return null;
    }

    const profile = await readContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'getUserProfile',
      args: [address],
    }) as UserProfile;

    return convertToFrontendProfile(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Creates a new user profile on the blockchain
 */
export async function createUserProfile(account: `0x${string}`, chain: any): Promise<boolean> {
  try {
    await writeContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'createUserProfile',
      args: [],
      account,
      chain,
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
}

/**
 * Updates user preferences on the blockchain
 */
export async function updateUserPreferences(
  preferences: {
    agentEnabled: boolean;
    notifications: boolean;
    theme: 'light' | 'dark';
  },
  account: `0x${string}`,
  chain: any
): Promise<boolean> {
  try {
    const themeValue = preferences.theme === 'light' ? 0 : 1;
    
    await writeContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'updateUserPreferences',
      args: [preferences.agentEnabled, preferences.notifications, themeValue],
      account,
      chain,
    });
    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
}

/**
 * Completes user onboarding on the blockchain
 */
export async function completeOnboarding(account: `0x${string}`, chain: any): Promise<boolean> {
  try {
    await writeContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'completeOnboarding',
      args: [],
      account,
      chain,
    });
    return true;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return false;
  }
}

/**
 * Gets user reputation from the blockchain (legacy support)
 */
export async function getUserReputation(address: string): Promise<number> {
  try {
    const reputation = await readContract(config, {
      abi: RecipeBook.abi,
      address: RECIPE_BOOK_ADDRESS,
      functionName: 'userReputation',
      args: [address],
    });
    return Number(reputation);
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    return 0;
  }
}