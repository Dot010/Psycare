"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  name: string;
  email: string;
  isCustomUser: boolean;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
  isLoading: boolean;
}

const defaultUser: UserProfile = {
  name: "Usuário Demonstração",
  email: "usuario@psycare.com.br",
  isCustomUser: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("@psycare:user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário do localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...data, isCustomUser: true };
      localStorage.setItem("@psycare:user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser precisa ser usado dentro de um UserProvider");
  }
  return context;
}