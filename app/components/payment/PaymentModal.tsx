'use client'

import { useEffect } from 'react';
import { usePayment } from '@/app/contexts/PaymentContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

// Main Component
export default function PaymentModal() {
  const {
    isPaymentOpen,
    paymentView,
    closePayment,
    resetPayment,
    checkoutUrl,
    errorMessage,
    setPaymentView,
    setErrorMessage
  } = usePayment();

  // Listen for messages from the iframe (success or cancel)
  useEffect(() => {
    if (!isPaymentOpen) return;

    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is from our app's origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data === 'stripe-payment-success') {
        setPaymentView('SUCCESS');
      } else if (event.data === 'stripe-payment-cancel') {
        setErrorMessage('Payment was cancelled.');
        setPaymentView('ERROR');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPaymentOpen, setPaymentView, setErrorMessage]);


  if (!isPaymentOpen) {
    return null;
  }

  const handleCloseAndReset = () => {
      closePayment();
      // Use a timeout to reset state after the modal has closed to avoid visual glitches
      setTimeout(resetPayment, 300);
  }

  const renderContent = () => {
    switch (paymentView) {
      case 'SELECT_METHOD':
        return <SelectMethodView />;

      case 'STRIPE_CHECKOUT':
        if (!checkoutUrl) {
            return <ErrorView message="Could not create payment session." onRetry={resetPayment} onClose={handleCloseAndReset} />;
        }
        return (
            <div>
                <h2 className="text-2xl font-bold text-center mb-4">Complete Your Purchase</h2>
                <iframe
                    src={checkoutUrl}
                    className="w-full h-[600px] border-0 rounded-md"
                    allow="payment"
                ></iframe>
            </div>
        );

      case 'PROCESSING':
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Processing your request...</p>
            </div>
        );

      case 'SUCCESS':
        return (
            <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground mb-6">Your collectibles have been added to your account. Check your email for a receipt.</p>
                <Button onClick={handleCloseAndReset}>Done</Button>
            </div>
        );

      case 'ERROR':
        return <ErrorView message={errorMessage || 'An unknown error occurred.'} onRetry={resetPayment} onClose={handleCloseAndReset} />;

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
      <Card className="relative bg-background rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <button onClick={handleCloseAndReset} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-6 w-6" />
        </button>
        {renderContent()}
      </Card>
    </div>
  );
}

// Sub-component for selecting a payment method
function SelectMethodView() {
    const { startStripePayment, startPaypalPayment } = usePayment();

    const handlePaypalClick = () => {
        if (startPaypalPayment) {
            startPaypalPayment();
        } else {
            alert("PayPal integration is not yet complete.");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6">Choose Payment Method</h2>
            <div className="grid gap-4">
                <Button variant="outline" className="h-14 text-lg justify-center flex items-center" onClick={() => startStripePayment()}>
                    <Image src="/images/stripe-logo.svg" alt="Stripe" width={60} height={25} />
                </Button>
                <Button variant="outline" className="h-14 text-lg justify-center flex items-center" onClick={handlePaypalClick}>
                    <Image src="/images/paypal-logo.svg" alt="PayPal" width={80} height={25} />
                </Button>
                 <Button variant="outline" className="h-14 text-lg justify-center flex items-center" disabled>
                    <Image src="/images/wallet-logo.svg" alt="Wallet" width={90} height={25} />
                </Button>
            </div>
        </div>
    );
}

// Sub-component for displaying errors
function ErrorView({ message, onRetry, onClose }: { message: string, onRetry: () => void, onClose: () => void }) {
    return (
        <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-muted-foreground bg-destructive/10 p-3 rounded-md mb-6">{message}</p>
            <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={onRetry}>Try Again</Button>
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
        </div>
    );
}