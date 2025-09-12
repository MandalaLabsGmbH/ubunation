'use client'

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/app/hooks/useTranslation';

export default function PaypalSuccessPageClient() {
    const { translate } = useTranslation();

    return (
        <div className="text-center py-20">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">{translate("paypalSuccessPage-title-1")}</h1>
            <p className="text-lg text-muted-foreground mb-8">
                {translate("paypalSuccessPage-description-1")}
            </p>
            <Link href="/main" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold">
                {translate("paypalSuccessPage-collectionButton-1")}
            </Link>
        </div>
    );
}