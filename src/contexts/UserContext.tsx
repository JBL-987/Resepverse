import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useRecipeStore } from '../store/recipestore';
import {
  getUserProfile,
  createUserProfile,
  updateUserPreferences as updateBlockchainPreferences,
  completeOnboarding as completeBlockchainOnboarding,
  FrontendUserProfile
} from '../services/blockchain';

// Use the interface from blockchain service
type UserProfile = FrontendUserProfile;

// Context type
interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  completeOnboarding: () => void;
  updateUserPreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  refreshUserData: () => Promise<void>;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider props
interface UserProviderProps {
  children: ReactNode;
}

// Provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Recipe store
  const { fetchRecipes } = useRecipeStore();

  // Initialize user when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      initializeUser(address);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [isConnected, address]);

  // Initialize user profile from blockchain
  const initializeUser = async (walletAddress: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Get user data from blockchain
      const blockchainUser = await getUserProfile(walletAddress);
      
      if (blockchainUser) {
        setUser(blockchainUser);
      } else {
        // Create new user profile on blockchain
        const success = await createUserProfile(walletAddress as `0x${string}`, { id: chainId });
        
        if (success) {
          // Fetch the newly created profile
          const newUser = await getUserProfile(walletAddress);
          if (newUser) {
            setUser(newUser);
          } else {
            throw new Error('Failed to fetch newly created profile');
          }
        } else {
          throw new Error('Failed to create user profile on blockchain');
        }
      }
    } catch (error) {
      setError('Failed to initialize user profile');
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Complete onboarding on blockchain
  const completeOnboarding = async (): Promise<void> => {
    if (!user || !address) return;
    
    try {
      setError(null);
      const success = await completeBlockchainOnboarding(address as `0x${string}`, { id: chainId });
      
      if (success) {
        // Refresh user data from blockchain
        await refreshUserData();
      } else {
        throw new Error('Failed to complete onboarding on blockchain');
      }
    } catch (error) {
      setError('Failed to complete onboarding');
      console.error('Error completing onboarding:', error);
    }
  };

  // Update user preferences on blockchain
  const updateUserPreferences = async (preferences: Partial<UserProfile['preferences']>): Promise<void> => {
    if (!user || !address) return;
    
    try {
      setError(null);
      const updatedPreferences = { ...user.preferences, ...preferences };
      
      const success = await updateBlockchainPreferences(
        updatedPreferences,
        address as `0x${string}`,
        { id: chainId }
      );
      
      if (success) {
        // Refresh user data from blockchain
        await refreshUserData();
      } else {
        throw new Error('Failed to update preferences on blockchain');
      }
    } catch (error) {
      setError('Failed to update user preferences');
      console.error('Error updating user preferences:', error);
    }
  };

  // Refresh user data from blockchain
  const refreshUserData = async (): Promise<void> => {
    if (!address || !isConnected) return;
    
    try {
      setError(null);
      
      // Refresh user profile from blockchain
      const updatedUser = await getUserProfile(address);
      if (updatedUser) {
        setUser(updatedUser);
      }
      
      // Refresh store data which will update reputation
      await fetchRecipes();
      
    } catch (error) {
      setError('Failed to refresh user data');
      console.error('Error refreshing user data:', error);
    }
  };

  // Context value
  const value: UserContextType = {
    user,
    loading,
    error,
    isConnected,
    completeOnboarding,
    updateUserPreferences,
    refreshUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};