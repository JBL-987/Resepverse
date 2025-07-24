import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useAccount, useDisconnect, useConnect } from "wagmi";

interface AuthContextType {
  isAuthenticated: boolean;
  connect: () => void;
  disconnect: () => void;
  address: string | undefined;
  isConnecting: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  connect: () => {},
  disconnect: () => {},
  address: undefined,
  isConnecting: false,
  error: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { connect: wagmiConnect, connectors, isPending } = useConnect();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setIsAuthenticated(false);
    }
  }, [isConnected, address]);

  const connect = async () => {
    try {
      setError(null);
      // Try to connect with the first available connector (usually MetaMask)
      const connector = connectors[0];
      if (connector) {
        wagmiConnect({ connector });
      } else {
        throw new Error("No wallet connector available");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      console.error("Error connecting wallet:", err);
    }
  };

  const disconnect = () => {
    try {
      wagmiDisconnect();
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect wallet");
      console.error("Error disconnecting wallet:", err);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      connect,
      disconnect,
      address,
      isConnecting: isPending,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};