'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

interface EditProfileModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const EditProfileModalContext = createContext<EditProfileModalContextType | undefined>(undefined);

export function EditProfileModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const value = { isOpen, openModal, closeModal };

  return (
    <EditProfileModalContext.Provider value={value}>
      {children}
    </EditProfileModalContext.Provider>
  );
}

export function useEditProfileModal() {
  const context = useContext(EditProfileModalContext);
  if (context === undefined) {
    throw new Error('useEditProfileModal must be used within an EditProfileModalProvider');
  }
  return context;
}