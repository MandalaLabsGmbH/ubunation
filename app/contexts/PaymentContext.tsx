'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import { useCart } from './CartContext';
import { useTranslation } from '@/app/hooks/useTranslation';

// PAYPAL_CHECKOUT will now render the JS SDK buttons, not an iframe
export type PaymentView = 'SELECT_METHOD' | 'STRIPE_ELEMENTS' | 'PAYPAL_CHECKOUT' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

interface PaymentContextType {
  isPaymentOpen: boolean;
  paymentView: PaymentView;
  clientSecret: string | null; // For Stripe
  paypalOrderID: string | null; // <-- New: For PayPal
  errorMessage: string | null;
  openPayment: () => void;
  startStripePayment: () => Promise<void>;
  startPaypalPayment: () => Promise<void>;
  setPaymentView: (view: PaymentView) => void;
  setErrorMessage: (message: string) => void;
  closePayment: () => void;
  resetPayment: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentView, setPaymentView] = useState<PaymentView>('SELECT_METHOD');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paypalOrderID, setPaypalOrderID] = useState<string | null>(null); // <-- New state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { cartItems } = useCart();
  const { language } = useTranslation();

  const openPayment = () => {
    resetPayment();
    setIsPaymentOpen(true);
  };

  const startStripePayment = async () => {
    setPaymentView('PROCESSING');
    try {
      const purchasePayload = {
        currency: 'STRIPE', status: 'NOTSTARTED',
        purchaseData: { cart: cartItems, language: language }
      };
      const createResponse = await fetch('/api/db/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchasePayload),
      });
      if (!createResponse.ok) throw new Error((await createResponse.json()).message);
      const { purchaseId } = await createResponse.json();

      const response = await fetch('/api/purchase/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cartItems, purchaseId: purchaseId }),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      const { clientSecret } = await response.json();
      
      setClientSecret(clientSecret);
      setPaymentView('STRIPE_ELEMENTS');

    } catch (error) {
      console.error("Stripe initiation error:", error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
      setPaymentView('ERROR');
    }
  };

  const startPaypalPayment = async () => {
    setPaymentView('PROCESSING');
    try {
        const purchasePayload = {
          currency: 'PAYPAL', status: 'NOTSTARTED',
          purchaseData: { cart: cartItems, language: language }
        };
        const createResponse = await fetch('/api/db/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchasePayload),
        });
        if (!createResponse.ok) throw new Error((await createResponse.json()).message);
        const { purchaseId } = await createResponse.json();

        const response = await fetch('/api/purchase/paypal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: cartItems, purchaseId: purchaseId }),
        });
        if (!response.ok) throw new Error((await response.json()).message);
        
        // The Fix: Expect 'orderID' from the backend response.
        const { orderID } = await response.json();
      
        setPaypalOrderID(orderID); // <-- Save the orderID
        setPaymentView('PAYPAL_CHECKOUT'); // <-- Switch to the new view

    } catch (error) {
        console.error("PayPal initiation error:", error);
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
        setPaymentView('ERROR');
    }
  };

  const closePayment = () => setIsPaymentOpen(false);
  
  const resetPayment = () => {
      setPaymentView('SELECT_METHOD');
      setClientSecret(null);
      setPaypalOrderID(null); // <-- Reset the orderID
      setErrorMessage(null);
  }

  const value = { 
    isPaymentOpen, paymentView, clientSecret, paypalOrderID, errorMessage,
    openPayment, startStripePayment, startPaypalPayment,
    setPaymentView, setErrorMessage, closePayment, resetPayment
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
