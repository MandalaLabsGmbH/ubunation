'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the User type to be used across the app
export interface User {
    userId?: number;
    username?: string;
    email: string;
    authData?: {
        country?: string;
        name?: string;
        newsletter?: '1' | '0';
    };
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = { user, setUser };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
