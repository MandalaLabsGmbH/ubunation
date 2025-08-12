'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the possible views for the auth modal
export type AuthModalView = 'login-email' | 'login-password' | 'register' | 'confirm-code';

interface AuthModalContextType {
  isOpen: boolean;
  redirectUrl: string;
  initialView: AuthModalView;
  initialEmail: string;
  // Update the openModal function signature
  openModal: (options?: { redirectUrl?: string; view?: AuthModalView; email?: string }) => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/');
  const [initialView, setInitialView] = useState<AuthModalView>('login-email');
  const [initialEmail, setInitialEmail] = useState('');

  const openModal = (options: { redirectUrl?: string; view?: AuthModalView; email?: string } = {}) => {
    setRedirectUrl(options.redirectUrl || '/');
    setInitialView(options.view || 'login-email');
    setInitialEmail(options.email || '');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const value = { isOpen, openModal, closeModal, redirectUrl, initialView, initialEmail };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within a AuthModalProvider');
  }
  return context;
}