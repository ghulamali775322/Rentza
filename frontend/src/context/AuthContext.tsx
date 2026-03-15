"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  token: string | null;
  name: string | null;
  login: (token: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  // Load token + name from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedName = localStorage.getItem("name");
    if (savedToken) setToken(savedToken);
    if (savedName) setName(savedName);
  }, []);

  // Login stores both token + name
  const login = (token: string, name: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("name", name);
    setToken(token);
    setName(name);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setToken(null);
    setName(null);
  };

  return (
    <AuthContext.Provider value={{ token, name, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
