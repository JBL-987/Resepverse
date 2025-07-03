import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAccount } from "wagmi";

interface AuthContextType {
  isAuthenticated: boolean;
  address?: string;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isConnected, address } = useAccount();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(isConnected);
  }, [isConnected]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, address }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 