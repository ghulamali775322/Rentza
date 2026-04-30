// context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  name: string | null;
  role: string | null;
  login: (token: string, name: string, role: string) => void;
  logout: () => void;
  loadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const savedToken = localStorage.getItem("token");
    const savedName = localStorage.getItem("name");
    const savedRole = localStorage.getItem("role");

    if (savedToken && savedRole) {
      setToken(savedToken);
      setName(savedName);
      setRole(savedRole);
    }
    setLoadingAuth(false);
  }, []);

  const login = (t: string, n: string, r: string) => {
    setToken(t);
    setName(n);
    setRole(r);

    // persist in localStorage
    localStorage.setItem("token", t);
    localStorage.setItem("name", n);
    localStorage.setItem("role", r);

    // 🔥 REQUIRED for middleware
    document.cookie = `role=${r}; path=/`;
  };

  const logout = () => {
    setToken(null);
    setName(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");

    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
  };

  return (
    <AuthContext.Provider
      value={{ token, name, role, login, logout, loadingAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
