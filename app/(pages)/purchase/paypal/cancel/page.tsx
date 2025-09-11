import { XCircle } from 'lucide-react';
import { useTranslation } from '@/app/hooks/useTranslation';
import Link from 'next/link';

export default function PayPalCancelPage() {
    const { translate } = useTranslation();
    return (
        <div className="text-center py-20">
            <XCircle className="h-24 w-24 text-destructive mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">{translate("paypalCancelPage-title-1")}</h1>
            <p className="text-lg text-muted-foreground mb-8">
                {translate("paypalCancelPage-description-1")}
            </p>
            <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold">
                {translate("paypalCancelPage-returnButton-1")} 
            </Link>
        </div>
    );
}
