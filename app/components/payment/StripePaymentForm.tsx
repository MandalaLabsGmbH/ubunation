'use client'

import { useState, FormEvent } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/app/contexts/PaymentContext';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/app/contexts/CartContext';

export default function StripePaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { setPaymentView, setErrorMessage } = usePayment();
  const { cartItems } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [isStripeReady, setIsStripeReady] = useState(false); // State for the form readiness

  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });
    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setPaymentView('ERROR');
    } else {
      setPaymentView('SUCCESS');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-center mb-4">Enter Payment Details</h2>
      <div className="space-y-2 my-6 text-sm text-muted-foreground">
        {cartItems.map(item => (
          <div key={item.collectibleId} className="flex justify-between items-center">
            <span className="truncate pr-2">{item.name}</span>
            <span className="flex-shrink-0 whitespace-nowrap">
              €{item.price.toFixed(2)} x {item.quantity} = €{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="border-t border-border my-2"></div>
        <div className="flex justify-between items-center font-bold text-lg text-foreground">
          <span>Total</span>
          <span>€{totalPrice.toFixed(2)}</span>
        </div>
      </div>
      
      {/* The Fix: Show a spinner until the PaymentElement is fully loaded */}
      {!isStripeReady && (
        <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading payment form...</p>
        </div>
      )}
      
      <div style={{ display: isStripeReady ? 'block' : 'none' }}>
        <PaymentElement onReady={() => setIsStripeReady(true)} />
      </div>
      
      <Button disabled={isLoading || !stripe || !elements || !isStripeReady} className="w-full mt-6">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Pay Now`}
      </Button>
    </form>
  );
}
