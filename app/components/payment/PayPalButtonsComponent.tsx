'use client'

import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { usePayment } from "@/app/contexts/PaymentContext";
import { Loader2 } from "lucide-react"; // Assuming you have lucide-react

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

// This inner component is needed to access the script loading state
function PayPalButtonWrapper() {
    const [{ isPending }] = usePayPalScriptReducer();
    const { paypalOrderID, setPaymentView, setErrorMessage } = usePayment();

    return (
        <>
            {/* The Fix: Show a spinner while the PayPal script is loading */}
            {isPending && (
                <div className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading PayPal...</p>
                </div>
            )}
            <div style={{ display: isPending ? 'none' : 'block' }}>
                <PayPalButtons
                    style={{ layout: "vertical" }}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    createOrder={(_data, _actions) => {
                        return Promise.resolve(paypalOrderID!);
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onApprove={(_data, _actions) => {
                        console.log("PayPal payment approved");
                        setPaymentView('SUCCESS');
                        return Promise.resolve();
                    }}
                    onError={(err) => {
                        console.error("PayPal button error:", err);
                        setErrorMessage("An error occurred with the PayPal payment.");
                        setPaymentView('ERROR');
                    }}
                    onCancel={() => {
                        setErrorMessage("The payment was cancelled.");
                        setPaymentView('ERROR');
                    }}
                />
            </div>
        </>
    );
}

export default function PayPalButtonsComponent() {
    const { paypalOrderID } = usePayment();

    if (!PAYPAL_CLIENT_ID) {
        console.error("PayPal Client ID is not configured.");
        return <div>PayPal is currently unavailable.</div>;
    }

    if (!paypalOrderID) {
        console.error("PayPal Order ID is missing.");
        return <div>Could not initialize PayPal payment.</div>;
    }

    const scriptOptions = {
        clientId: PAYPAL_CLIENT_ID,
        currency: "EUR",
        "disable-funding": "card,sepa" 
    };

    return (
        <PayPalScriptProvider options={scriptOptions}>
            <h2 className="text-2xl font-bold text-center mb-4">Complete Your Purchase</h2>
            <PayPalButtonWrapper />
        </PayPalScriptProvider>
    );
}
