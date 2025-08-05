'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import { useCart } from './CartContext';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useSession } from 'next-auth/react';

// PAYPAL_CHECKOUT will now render the JS SDK buttons, not an iframe
export type PaymentView = 'GET_EMAIL' | 'SELECT_METHOD' | 'STRIPE_ELEMENTS' | 'PAYPAL_CHECKOUT' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

interface PaymentContextType {
  isPaymentOpen: boolean;
  paymentView: PaymentView;
  clientSecret: string | null;
  paypalOrderID: string | null;
  purchaseId: number | null;
  guestEmail: string;
  errorMessage: string | null;
  openPayment: () => void;
  setGuestEmail: (email: string) => void;
  startStripePayment: () => Promise<void>;
  startPaypalPayment: () => Promise<void>;
  pollPurchaseStatus: (id: number) => void;
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
  const [paypalOrderID, setPaypalOrderID] = useState<string | null>(null);
  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { cartItems } = useCart();
  const { language } = useTranslation();
  const { data: session } = useSession();

  const openPayment = () => {
    resetPayment();
    setIsPaymentOpen(true);
  };

   const pollPurchaseStatus = (id: number) => {
    setPaymentView('PROCESSING');
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      // The Fix: When the polling times out...
      if (attempts > 15) { // Timeout after 30 seconds
        clearInterval(interval);
        try {
            await fetch('/api/purchase/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ purchaseId: id }),
            });
            console.log(`Cancellation request sent for purchase ${id}`);
        } catch (cancelError) {
            console.error("Failed to send cancellation request:", cancelError);
        }

        setErrorMessage("Your payment took too long to confirm and has been cancelled. You have not been charged.");
        setPaymentView('ERROR');
        return;
      }
      try {
        const response = await fetch(`/api/paypal/purchaseStatus?purchaseId=${id}`);
        if (response.ok) {
          const { status } = await response.json();
          if (status === 'COMPLETE') {
            clearInterval(interval);
            setPaymentView('SUCCESS');
          } else if (['DECLINED', 'CANCELLED', 'ERROR'].includes(status)) {
            clearInterval(interval);
            setErrorMessage("Your payment could not be completed.");
            setPaymentView('ERROR');
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Check every 2 seconds
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
     const createdPurchase = await createResponse.json();
      setPurchaseId(createdPurchase.purchaseId);
      const response = await fetch('/api/purchase/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cart: cartItems, 
          purchaseId: createdPurchase.purchaseId, 
          email: session ? undefined : guestEmail 
        }),
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
        const createdPurchase = await createResponse.json();
        setPurchaseId(createdPurchase.purchaseId);

        const response = await fetch('/api/purchase/paypal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              cart: cartItems, 
              purchaseId: createdPurchase.purchaseId, 
              email: session ? undefined : guestEmail 
            }),
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
      setPaypalOrderID(null); 
      setPurchaseId(null);
      setGuestEmail('');
      setErrorMessage(null);
  }

  const value = { 
    isPaymentOpen, paymentView, clientSecret, paypalOrderID, purchaseId, guestEmail, errorMessage,
    openPayment, setGuestEmail, startStripePayment, startPaypalPayment, pollPurchaseStatus,
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
