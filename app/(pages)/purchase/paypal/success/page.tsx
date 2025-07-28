import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PayPalSuccessPage() {
    return (
        <div className="text-center py-20">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground mb-8">
                Your order is being processed. You will receive an email confirmation shortly.
            </p>
            <Link href="/main" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold">
                Go to My Collection
            </Link>
        </div>
    );
}
