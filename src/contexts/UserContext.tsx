import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile } from '../services/authService';
import { useChatStore } from '../store/chatStore';

// Context type
interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  connectWallet: () => Promise<string>;
  completeOnboarding: () => void;
  updateUserPreferences: (preferences: Partial<UserProfile['preferences']>) => void;
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
  const chatStore = useChatStore();
  
  // Initialize user from auth service
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // If user exists, connect to chat store
    if (currentUser && currentUser.blockchainAddress) {
      chatStore.connectWallet(currentUser.blockchainAddress);
      
      // Set agent preferences
      if (currentUser.preferences.agentEnabled) {
        chatStore.enableAgent(true);
      }
    }
    
    setLoading(false);
  }, []);
  
  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.signInWithGoogle();
      setUser(user);
      
      // If user has blockchain address, connect to chat store
      if (user.blockchainAddress) {
        chatStore.connectWallet(user.blockchainAddress);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with email
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.signInWithEmail(email, password);
      setUser(user);
      
      // If user has blockchain address, connect to chat store
      if (user.blockchainAddress) {
        chatStore.connectWallet(user.blockchainAddress);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Connect wallet
  const connectWallet = async (): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const address = await authService.connectWallet(user.id);
      
      // Update local user state
      setUser(prev => prev ? { ...prev, blockchainAddress: address } : null);
      
      return address;
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Complete onboarding
  const completeOnboarding = (): void => {
    if (!user) return;
    
    authService.completeOnboarding(user.id);
    setUser(prev => prev ? { ...prev, isOnboarded: true } : null);
  };
  
  // Update user preferences
  const updateUserPreferences = (preferences: Partial<UserProfile['preferences']>): void => {
    if (!user) return;
    
    authService.updateUserPreferences(user.id, preferences);
    setUser(prev => prev ? { 
      ...prev, 
      preferences: { ...prev.preferences, ...preferences } 
    } : null);
    
    // Update agent status in chat store if needed
    if (preferences.agentEnabled !== undefined) {
      chatStore.enableAgent(preferences.agentEnabled);
    }
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    connectWallet,
    completeOnboarding,
    updateUserPreferences
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
