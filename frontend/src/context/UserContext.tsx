"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of our user context
interface UserContextType {
  name: string;
  profilePhotoUrl: string;
  setName: (name: string) => void;
  setProfilePhotoUrl: (url: string) => void;
  clearUser: () => void; // ✅ ADD THIS
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  name: "",
  profilePhotoUrl: "",
  setName: () => {},
  setProfilePhotoUrl: () => {},
  clearUser: () => {},
});

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [name, setName] = useState<string>("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");
  const clearUser = () => {
    setName("");
    setProfilePhotoUrl("");
  };

  return (
    <UserContext.Provider
      value={{ name, profilePhotoUrl, setName, setProfilePhotoUrl, clearUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use user context
export const useUser = () => useContext(UserContext);
