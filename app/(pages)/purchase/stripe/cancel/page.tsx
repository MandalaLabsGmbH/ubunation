'use client'

import { useEffect } from 'react';

export default function StripeCancelPage() {
    useEffect(() => {
        // Send a message to the parent window to update the UI
        window.parent.postMessage('stripe-payment-cancel', window.location.origin);
    }, []);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <p>Returning to your cart...</p>
            </div>
        </div>
    );
}
