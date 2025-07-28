'use client'

import { useEffect } from 'react';

export default function StripeSuccessPage() {
    useEffect(() => {
        // Send a message to the parent window to update the UI
        window.parent.postMessage('stripe-payment-success', window.location.origin);
    }, []);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4">Finalizing your payment...</p>
            </div>
        </div>
    );
}
