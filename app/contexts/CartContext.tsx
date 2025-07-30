'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';

export interface CartItem {
  collectibleId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number; 
}

interface CartContextType {
  isOpen: boolean;
  cartItems: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (collectibleId: number, quantity: number) => void;
  updateItemQuantity: (collectibleId: number, newQuantity: number) => void; // New function
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = Cookies.get('shopping-cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart from cookies", e);
      }
    }
  }, []);

  useEffect(() => {
    Cookies.set('shopping-cart', JSON.stringify(cartItems), { expires: 7 });
  }, [cartItems]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (itemToAdd: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.collectibleId === itemToAdd.collectibleId);
      if (existingItem) {
        return prevItems.map(item =>
          item.collectibleId === itemToAdd.collectibleId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...itemToAdd, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (collectibleId: number, quantityToRemove: number) => {
    setCartItems(prevItems => {
        const itemToUpdate = prevItems.find(item => item.collectibleId === collectibleId);
        if (itemToUpdate) {
            const newQuantity = itemToUpdate.quantity - quantityToRemove;
            if (newQuantity > 0) {
                return prevItems.map(item =>
                    item.collectibleId === collectibleId
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            } else {
                return prevItems.filter(item => item.collectibleId !== collectibleId);
            }
        }
        return prevItems;
    });
  };

  // The Fix: New function to directly set an item's quantity.
  const updateItemQuantity = (collectibleId: number, newQuantity: number) => {
    setCartItems(prevItems => {
      if (newQuantity <= 0) {
        // If the new quantity is 0 or less, remove the item from the cart.
        return prevItems.filter(item => item.collectibleId !== collectibleId);
      }
      return prevItems.map(item =>
        item.collectibleId === collectibleId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const value = { isOpen, cartItems, openCart, closeCart, addToCart, removeFromCart, updateItemQuantity, clearCart, itemCount };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
