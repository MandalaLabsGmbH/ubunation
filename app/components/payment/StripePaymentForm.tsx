'use client'

import { useState, FormEvent } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/app/contexts/PaymentContext';
import { Loader2 } from 'lucide-react';

export default function StripePaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { setPaymentView, setErrorMessage } = usePayment();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // This is where the user will be redirected after paying.
        // The success/cancel pages are no longer needed for the UI flow,
        // but are still good for tracking. The webhook is the source of truth.
        return_url: `${window.location.origin}/`,
      },
      // We redirect here so the webhook can process. The UI will update
      // based on the webhook event in a real-world scenario, or you
      // can poll the purchase status. For now, we'll show success immediately.
      redirect: 'if_required'
    });

    if (error) {
      // This will display the payment error message (e.g., "Your card was declined").
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setPaymentView('ERROR');
    } else {
      // Payment has been successfully processed.
      setPaymentView('SUCCESS');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-center mb-4">Enter Payment Details</h2>
      <PaymentElement />
      <Button disabled={isLoading || !stripe || !elements} className="w-full mt-6">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          `Pay Now`
        )}
      </Button>
    </form>
  );
}
