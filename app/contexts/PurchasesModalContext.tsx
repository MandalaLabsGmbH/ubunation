'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

interface PurchasesModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const PurchasesModalContext = createContext<PurchasesModalContextType | undefined>(undefined);

export function PurchasesModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const value = { isOpen, openModal, closeModal };

  return (
    <PurchasesModalContext.Provider value={value}>
      {children}
    </PurchasesModalContext.Provider>
  );
}

export function usePurchasesModal() {
  const context = useContext(PurchasesModalContext);
  if (context === undefined) {
    throw new Error('usePurchasesModal must be used within a PurchasesModalProvider');
  }
  return context;
}
