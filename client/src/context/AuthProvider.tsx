"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useMeQuery, type User } from "../__generated__/graphql";

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refetchUser: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);

  // URQL me query
  const [meResult, refetchMe] = useMeQuery({
    pause: !shouldFetch, // Only fetch when we have a token
  });

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setShouldFetch(true); // Enable the URQL query
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Handle URQL query results
  useEffect(() => {
    if (meResult.data?.me) {
      setUser(meResult.data.me as any);
      localStorage.setItem("user", JSON.stringify(meResult.data.me));
    } else if (meResult.error) {
      console.error("Failed to fetch user:", meResult.error);
      // Token might be invalid, clear it
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setShouldFetch(false);
    }
  }, [meResult.data, meResult.error]);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setShouldFetch(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShouldFetch(false);
  };

  const refetchUser = () => {
    refetchMe({ requestPolicy: "network-only" });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
