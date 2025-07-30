'use client'

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { usePayment } from "@/app/contexts/PaymentContext";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

export default function PayPalButtonsComponent() {
    const { paypalOrderID, setPaymentView, setErrorMessage } = usePayment();

    if (!PAYPAL_CLIENT_ID) {
        console.error("PayPal Client ID is not configured.");
        return <div>PayPal is currently unavailable.</div>;
    }

    if (!paypalOrderID) {
        console.error("PayPal Order ID is missing.");
        return <div>Could not initialize PayPal payment.</div>;
    }

    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR" }}>
            <h2 className="text-2xl font-bold text-center mb-4">Complete Your Purchase</h2>
            <PayPalButtons
                style={{ layout: "vertical" }}
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                createOrder={(_data, _actions) => {
                    // We return the orderID that was already created on our server
                    return Promise.resolve(paypalOrderID);
                }}
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onApprove={(_data, _actions) => {
                    // This function is called after the user approves the payment on PayPal.
                    // The payment is captured automatically by our backend webhook.
                    // We can now show the success message to the user.
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
        </PayPalScriptProvider>
    );
}
