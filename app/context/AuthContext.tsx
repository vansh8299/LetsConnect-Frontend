"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useMe, useLogin, useSignup, useLogout } from "../lib/hooks";
import { authService } from "../lib/services/auth.service";
import { User, LoginInput, SignupInput } from "../lib/types/auth.types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => void;
  isAuthenticated: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: meUser, loading: meLoading, error: meError, refetch } = useMe();
  const {
    login: loginMutation,
    loading: loginLoading,
    error: loginError,
  } = useLogin();
  const {
    signup: signupMutation,
    loading: signupLoading,
    error: signupError,
  } = useSignup();
  const {
    logout: logoutMutation,
    loading: logoutLoading,
    error: logoutError,
  } = useLogout();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update error state from any mutation
    if (loginError) setError(loginError.message);
    if (signupError) setError(signupError.message);
    if (logoutError) setError(logoutError.message);
    if (meError) setError(meError.message);
  }, [loginError, signupError, logoutError, meError]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const loginInput: LoginInput = { email, password };
      const result = await loginMutation(loginInput);
      if (result) {
        // Cookies are set by backend, refetch user data
        await refetch();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const signupInput: SignupInput = { name, email, password };
      const result = await signupMutation(signupInput);
      if (result) {
        // Cookies are set by backend, refetch user data
        await refetch();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Signup failed";
      setError(errorMsg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      // Backend clears cookies, then refetch to clear user state
      await logoutMutation();
      await refetch();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Logout failed";
      setError(errorMsg);
      throw err;
    }
  };

  const googleLogin = () => {
    authService.googleLogin();
  };

  const refetchUser = async () => {
    await refetch();
  };

  const loading = meLoading || loginLoading || signupLoading || logoutLoading;

  return (
    <AuthContext.Provider
      value={{
        user: meUser || null,
        loading,
        error,
        login,
        signup,
        logout,
        googleLogin,
        isAuthenticated: !!meUser,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * Must be used within AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
