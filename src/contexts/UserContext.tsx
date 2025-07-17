import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useRecipeStore } from '../store/recipestore';

// User Profile interface (simplified for blockchain focus)
interface UserProfile {
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
  
  // Recipe store
  const { 
    userReputation, 
    setWalletAddress, 
    updateConnectionStatus,
    refreshUserData: refreshStoreData
  } = useRecipeStore();

  // Initialize user when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      initializeUser(address);
      setWalletAddress(address);
      updateConnectionStatus(true);
    } else {
      setUser(null);
      setWalletAddress(null);
      updateConnectionStatus(false);
    }
    setLoading(false);
  }, [isConnected, address, setWalletAddress, updateConnectionStatus]);

  // Update user reputation when store updates
  useEffect(() => {
    if (user && userReputation !== user.reputation) {
      setUser(prev => prev ? { ...prev, reputation: userReputation } : null);
    }
  }, [userReputation, user]);

  // Initialize user profile
  const initializeUser = (walletAddress: string) => {
    try {
      setError(null);
      
      // Get user data from localStorage or create new profile
      const storedUser = localStorage.getItem(`user_${walletAddress}`);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        // Create new user profile
        const newUser: UserProfile = {
          id: walletAddress,
          address: walletAddress,
          reputation: 0,
          recipesCreated: 0,
          votesReceived: 0,
          isOnboarded: false,
          preferences: {
            agentEnabled: true,
            notifications: true,
            theme: 'light'
          }
        };
        
        setUser(newUser);
        saveUserToStorage(newUser);
      }
    } catch (error) {
      setError('Failed to initialize user profile');
      console.error('Error initializing user:', error);
    }
  };

  // Save user to localStorage
  const saveUserToStorage = (userData: UserProfile) => {
    try {
      localStorage.setItem(`user_${userData.address}`, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  // Complete onboarding
  const completeOnboarding = (): void => {
    if (!user) return;
    
    const updatedUser = { ...user, isOnboarded: true };
    setUser(updatedUser);
    saveUserToStorage(updatedUser);
  };

  // Update user preferences
  const updateUserPreferences = (preferences: Partial<UserProfile['preferences']>): void => {
    if (!user) return;
    
    const updatedUser = { 
      ...user, 
      preferences: { ...user.preferences, ...preferences } 
    };
    
    setUser(updatedUser);
    saveUserToStorage(updatedUser);
  };

  // Refresh user data from blockchain
  const refreshUserData = async (): Promise<void> => {
    if (!user || !isConnected) return;
    
    try {
      setError(null);
      
      // Refresh store data which will update reputation
      await refreshStoreData();
      
      // You can add more blockchain data fetching here
      // For example: recipes created count, votes received, etc.
      
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