'use client'

import { useEffect, useState, FormEvent } from 'react';
import { usePayment } from '@/app/contexts/PaymentContext';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/app/contexts/CartContext';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/app/contexts/AuthModalContext';
import { cognitoInitiateEmailLogin } from '@/app/_helpers/registerHelper';

// --- Stripe Elements Imports ---
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './StripePaymentForm';
// --- PayPal SDK Import ---
import PayPalButtonsComponent from './PayPalButtonsComponent';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentModal() {
  const {
    isPaymentOpen,
    paymentView,
    closePayment,
    resetPayment,
    clientSecret,
    paypalOrderID,
    errorMessage,
    guestEmail,
    setPaymentView,
    setErrorMessage
  } = usePayment();
  
  const { clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const { openModal: openAuthModal } = useAuthModal();
  const { translate } = useTranslation();

  useEffect(() => {
    if (!isPaymentOpen) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data === 'stripe-payment-success' || event.data === 'paypal-payment-success') {
        setPaymentView('SUCCESS');
      } else if (event.data === 'stripe-payment-cancel' || event.data === 'paypal-payment-cancel') {
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
      setTimeout(resetPayment, 300);
  }

  const handleCreateAccountAndLogin = async () => {
    if (guestEmail) {
        try {
            await cognitoInitiateEmailLogin(guestEmail);
            clearCart();
            closePayment();
            setTimeout(() => {
                resetPayment();
                openAuthModal({ view: 'confirm-code', email: guestEmail });
            }, 300);
        } catch (error) {
            console.error("Failed to initiate email login for guest:", error);
            setErrorMessage("Could not start the login process. Please try again from the login page.");
            setPaymentView('ERROR');
        }
    }
  };

  const handleContinueAsGuest = () => {
    clearCart();
    closePayment();
    setTimeout(() => {
        resetPayment();
        router.push('/');
    }, 300);
  };
  
  const handleDoneForLoggedInUser = () => {
    clearCart();
    closePayment();
    setTimeout(() => {
        resetPayment();
        router.push('/collectibles');
    }, 300);
  }

  const renderContent = () => {
    switch (paymentView) {
      case 'GET_EMAIL':
        return <GetEmailView />;
      case 'SELECT_METHOD':
        return <SelectMethodView />;
      case 'STRIPE_ELEMENTS':
        if (!clientSecret) {
            return <ErrorView message="Could not initialize Stripe payment." onRetry={resetPayment} onClose={handleCloseAndReset} />;
        }
        return (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm />
            </Elements>
          </div>
        );
      case 'PAYPAL_CHECKOUT':
        if (!paypalOrderID) {
            return <ErrorView message="Could not create PayPal payment session." onRetry={resetPayment} onClose={handleCloseAndReset} />;
        }
        return <PayPalButtonsComponent />;
      case 'PROCESSING':
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{translate("paymentModal-processingMessage-1")}</p>
            </div>
        );
      case 'SUCCESS':
        return (
            <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{translate("paymentModal-successTitle-1")}</h2>
                
                {!session ? (
                    <>
                        <p className="text-muted-foreground mb-4">
                            {translate("paymentModal-guestSuccessMessage-1")} <span className="font-semibold text-foreground">{guestEmail}</span>.
                        </p>
                        <p className="text-muted-foreground mb-6">{translate("paymentModal-guestSuccessPrompt-1")}</p>
                        <Button onClick={handleCreateAccountAndLogin} className="mb-4">{translate("paymentModal-createAccountButton-1")}</Button>
                        <Button variant="ghost" onClick={handleContinueAsGuest}>{translate("paymentModal-guestContinueButton-1")}</Button>
                    </>
                ) : (
                    <>
                        <p className="text-muted-foreground mb-6">{translate("paymentModal-loggedInSuccessMessage-1")}</p>
                        <Button onClick={handleDoneForLoggedInUser}>{translate("paymentModal-doneButton-1")}</Button>
                    </>
                )}
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
    const { translate } = useTranslation();

    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6">{translate("paymentModal-selectMethodTitle-1")}</h2>
            <div className="grid gap-4">
                <Button variant="outline" className="h-14 text-lg justify-center flex items-center" onClick={() => startStripePayment()}>
                    <Image src="/images/svg/stripe.svg" alt="Stripe" width={60} height={25} />
                </Button>
                <Button variant="outline" className="h-14 text-lg justify-center flex items-center" onClick={() => startPaypalPayment()}>
                    <Image src="/images/svg/paypal.svg" alt="PayPal" width={80} height={25} />
                </Button>
            </div>
        </div>
    );
}

// --- Sub-component for Email Collection ---
function GetEmailView() {
    const [email, setEmail] = useState('');
    const { setPaymentView, setGuestEmail } = usePayment();

    useEffect(() => {
        const savedEmail = Cookies.get('guest-email');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setGuestEmail(email);
        setPaymentView('SELECT_METHOD');
    };
    const { translate } = useTranslation();
    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6">{translate("paymentModal-guestTitle-1")}</h2>
            <p className="text-center text-muted-foreground mb-4">{translate("paymentModal-guestPrompt-1")}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="guest-email">{translate("paymentModal-guestEmailLabel-1")}</Label>
                    <Input 
                        id="guest-email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        placeholder="you@example.com"
                    />
                </div>
                <Button type="submit" className="w-full">{translate("paymentModal-guestContinueButton-2")}</Button>
            </form>
        </div>
    );
}

// Sub-component for displaying errors
function ErrorView({ message, onRetry, onClose }: { message: string, onRetry: () => void, onClose: () => void }) {
  const { translate } = useTranslation();  
  return (
        <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{translate("paymentModal-errorTitle-1")}</h2>
            <p className="text-muted-foreground bg-destructive/10 p-3 rounded-md mb-6">{message}</p>
            <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={onRetry}>{translate("paymentModal-retryButton-1")}</Button>
                <Button variant="secondary" onClick={onClose}>{translate("paymentModal-closeButton-1")}</Button>
            </div>
        </div>
    );
}
