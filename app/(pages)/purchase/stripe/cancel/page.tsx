'use client'

import { useEffect } from 'react';
import { useTranslation } from '@/app/hooks/useTranslation';

export default function StripeCancelPage() {
    const { translate } = useTranslation();
    useEffect(() => {
        // Send a message to the parent window to update the UI
        window.parent.postMessage('stripe-payment-cancel', window.location.origin);
    }, []);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <p>{translate("stripeCancelPage-message-1")}</p>
            </div>
        </div>
    );
}
