'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import { useCart } from './CartContext'; // Import useCart
import { useTranslation } from '@/app/hooks/useTranslation'; // Import useTranslation

export type PaymentView = 'SELECT_METHOD' | 'STRIPE_CHECKOUT' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

interface PaymentContextType {
  isPaymentOpen: boolean;
  paymentView: PaymentView;
  checkoutUrl: string | null;
  errorMessage: string | null;
  startStripePayment: () => Promise<void>; // No longer needs cartItems as an argument
  startPaypalPayment: () => Promise<void>; // No longer needs cartItems as an argument
  setPaymentView: (view: PaymentView) => void;
  setErrorMessage: (message: string) => void;
  closePayment: () => void;
  resetPayment: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentView, setPaymentView] = useState<PaymentView>('SELECT_METHOD');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { cartItems } = useCart(); // Get cartItems from the CartContext
  const { language } = useTranslation(); // Get the current language

  const startStripePayment = async () => {
    if (!isPaymentOpen) setIsPaymentOpen(true);
    setPaymentView('PROCESSING');

    try {
      const createResponse = await fetch('/api/db/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            paymentMethod: 'STRIPE', 
            cart: cartItems, 
            language: language 
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || 'Failed to create purchase record.');
      }

      const { purchaseId } = await createResponse.json();

      const response = await fetch('/api/purchase/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cartItems, purchaseId: purchaseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start Stripe payment.');
      }

      const { checkoutUrl } = await response.json();
      
      setCheckoutUrl(checkoutUrl);
      setPaymentView('STRIPE_CHECKOUT');

    } catch (error) {
      console.error("Stripe initiation error:", error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
      setPaymentView('ERROR');
    }
  };

  const startPaypalPayment = async () => {
    if (!isPaymentOpen) setIsPaymentOpen(true);
    setPaymentView('PROCESSING');

    try {
        const createResponse = await fetch('/api/db/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                paymentMethod: 'PAYPAL', 
                cart: cartItems, 
                language: language 
            }),
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.message || 'Failed to create purchase record.');
        }

        const { purchaseId } = await createResponse.json();

        const response = await fetch('/api/purchase/paypal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: cartItems, purchaseId: purchaseId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create PayPal order.');
        }

        const { checkoutUrl } = await response.json();
      
        setCheckoutUrl(checkoutUrl);
        setPaymentView('STRIPE_CHECKOUT');

    } catch (error) {
        console.error("PayPal initiation error:", error);
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
        setPaymentView('ERROR');
    }
  };

  const closePayment = () => {
    setIsPaymentOpen(false);
  };
  
  const resetPayment = () => {
      setPaymentView('SELECT_METHOD');
      setCheckoutUrl(null);
      setErrorMessage(null);
  }

  const value = { 
    isPaymentOpen, 
    paymentView, 
    checkoutUrl,
    errorMessage,
    startStripePayment,
    startPaypalPayment,
    setPaymentView,
    setErrorMessage,
    closePayment,
    resetPayment
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
