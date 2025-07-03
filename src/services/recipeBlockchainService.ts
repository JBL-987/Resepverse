import { createPublicClient, createWalletClient, http } from 'viem';
import { liskSepolia } from 'viem/chains';
import { recipeContractABI } from '../utils/abi';

const RECIPE_CONTRACT_ADDRESS = import.meta.env.VITE_RESEPVERSE_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: liskSepolia,
  transport: http(),
});

export async function fetchAllRecipes(): Promise<any[]> {
  try {
    const recipes = await publicClient.readContract({
      address: RECIPE_CONTRACT_ADDRESS,
      abi: recipeContractABI,
      functionName: 'getAllRecipes',
    });
    return Array.from(recipes);
  } catch (error) {
    console.error('Gagal fetch recipes:', error);
    return [];
  }
}

export async function submitRecipe({
  title,
  description,
  imageUrl,
  account,
}: {
  title: string;
  description: string;
  imageUrl: string;
  account: `0x${string}`;
}): Promise<any> {
  try {
    const tx = await walletClient.writeContract({
      address: RECIPE_CONTRACT_ADDRESS,
      abi: recipeContractABI,
      functionName: 'submitRecipe',
      args: [title, description, imageUrl],
      account,
    });
    return tx;
  } catch (error) {
    console.error('Gagal submit recipe:', error);
    throw error;
  }
}

export async function voteRecipe({
  recipeId,
  account,
}: {
  recipeId: number;
  account: `0x${string}`;
}): Promise<any> {
  try {
    const tx = await walletClient.writeContract({
      address: RECIPE_CONTRACT_ADDRESS,
      abi: recipeContractABI,
      functionName: 'voteRecipe',
      args: [BigInt(recipeId)],
      account,
    });
    return tx;
  } catch (error) {
    console.error('Gagal vote recipe:', error);
    throw error;
  }
} 