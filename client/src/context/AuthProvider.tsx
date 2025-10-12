"use client";

import { apolloClient } from "@/libs/apolloClient";
import {
  MeDocument,
  type MeQuery,
  type User,
} from "@/libs/graphql/generated/graphql";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Verify token is still valid by fetching fresh user data
          try {
            const { data } = await apolloClient.query<MeQuery>({
              query: MeDocument,
              errorPolicy: "all",
            });

            if (data?.me) {
              setUser(data.me);
            }
          } catch (error) {
            console.error("Failed to fetch user:", error);
            // Token might be invalid, clear it
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
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

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refetchUser = async () => {
    try {
      const { data } = await apolloClient.query<MeQuery>({
        query: MeDocument,
        fetchPolicy: "network-only",
      });

      if (data?.me) {
        setUser(data.me);
        localStorage.setItem("user", JSON.stringify(data.me));
      }
    } catch (error) {
      console.error("Failed to refetch user:", error);
    }
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
