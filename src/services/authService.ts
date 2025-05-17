/**
 * Authentication Service for Telepathia AI
 * 
 * Handles user authentication, profile management, and blockchain address integration.
 */

import { ethers } from 'ethers';
import { useChatStore } from '../store/chatStore';

// Types
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  blockchainAddress?: string;
  isOnboarded: boolean;
  createdAt: number;
  lastActive: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    voiceEnabled: boolean;
    voiceId?: string;
    agentEnabled: boolean;
  };
}

// Mock authentication for development (would be replaced with Firebase/Auth0 in production)
class AuthService {
  private static instance: AuthService;
  private users: Map<string, UserProfile> = new Map();
  private currentUser: UserProfile | null = null;
  
  // Private constructor for singleton pattern
  private constructor() {
    // Load users from localStorage
    try {
      const storedUsers = localStorage.getItem('telepathia_users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers) as UserProfile[];
        parsedUsers.forEach(user => {
          this.users.set(user.id, user);
        });
      }
      
      // Check for logged in user
      const storedUser = localStorage.getItem('telepathia_current_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
    }
  }
  
  // Get singleton instance
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  // Get current user
  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }
  
  // Sign in with email (mock)
  public async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    // In a real implementation, this would validate credentials with a backend
    
    // Check if user exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === email);
    
    if (existingUser) {
      this.currentUser = existingUser;
      localStorage.setItem('telepathia_current_user', JSON.stringify(existingUser));
      
      // Update last active
      this.updateUserLastActive(existingUser.id);
      
      return existingUser;
    }
    
    throw new Error('Invalid email or password');
  }
  
  // Sign in with Google (mock)
  public async signInWithGoogle(): Promise<UserProfile> {
    // In a real implementation, this would use Firebase/Auth0 Google auth
    
    // For demo, create a mock Google user
    const mockGoogleId = `google_${Math.random().toString(36).substring(2, 11)}`;
    const mockEmail = `user_${mockGoogleId.substring(7)}@gmail.com`;
    const mockName = `User ${mockGoogleId.substring(7, 10)}`;
    
    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === mockEmail);
    
    if (existingUser) {
      this.currentUser = existingUser;
      localStorage.setItem('telepathia_current_user', JSON.stringify(existingUser));
      
      // Update last active
      this.updateUserLastActive(existingUser.id);
      
      return existingUser;
    }
    
    // Create new user
    const newUser: UserProfile = {
      id: mockGoogleId,
      displayName: mockName,
      email: mockEmail,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(mockName)}&background=random`,
      isOnboarded: false,
      createdAt: Date.now(),
      lastActive: Date.now(),
      preferences: {
        theme: 'dark',
        notifications: true,
        voiceEnabled: true,
        agentEnabled: false
      }
    };
    
    // Save user
    this.users.set(newUser.id, newUser);
    this.currentUser = newUser;
    
    // Save to localStorage
    this.saveUsers();
    localStorage.setItem('telepathia_current_user', JSON.stringify(newUser));
    
    return newUser;
  }
  
  // Sign out
  public async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('telepathia_current_user');
    
    // Clear chat store
    const chatStore = useChatStore.getState();
    chatStore.logout();
  }
  
  // Connect blockchain wallet
  public async connectWallet(userId: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Update user profile
      const user = this.users.get(userId);
      if (user) {
        user.blockchainAddress = address;
        this.users.set(userId, user);
        
        if (this.currentUser && this.currentUser.id === userId) {
          this.currentUser.blockchainAddress = address;
          localStorage.setItem('telepathia_current_user', JSON.stringify(this.currentUser));
        }
        
        // Save to localStorage
        this.saveUsers();
        
        // Update chat store
        const chatStore = useChatStore.getState();
        chatStore.connectWallet(address);
      }
      
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }
  
  // Complete onboarding
  public completeOnboarding(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.isOnboarded = true;
      this.users.set(userId, user);
      
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.isOnboarded = true;
        localStorage.setItem('telepathia_current_user', JSON.stringify(this.currentUser));
      }
      
      // Save to localStorage
      this.saveUsers();
    }
  }
  
  // Update user preferences
  public updateUserPreferences(userId: string, preferences: Partial<UserProfile['preferences']>): void {
    const user = this.users.get(userId);
    if (user) {
      user.preferences = { ...user.preferences, ...preferences };
      this.users.set(userId, user);
      
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
        localStorage.setItem('telepathia_current_user', JSON.stringify(this.currentUser));
      }
      
      // Save to localStorage
      this.saveUsers();
    }
  }
  
  // Update user last active
  public updateUserLastActive(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.lastActive = Date.now();
      this.users.set(userId, user);
      
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.lastActive = Date.now();
        localStorage.setItem('telepathia_current_user', JSON.stringify(this.currentUser));
      }
      
      // Save to localStorage
      this.saveUsers();
    }
  }
  
  // Get all users (for contacts)
  public getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }
  
  // Save users to localStorage
  private saveUsers(): void {
    try {
      localStorage.setItem('telepathia_users', JSON.stringify(Array.from(this.users.values())));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// For TypeScript to recognize window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}
