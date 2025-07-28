import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PayPalCancelPage() {
    return (
        <div className="text-center py-20">
            <XCircle className="h-24 w-24 text-destructive mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
            <p className="text-lg text-muted-foreground mb-8">
                Your payment was not completed. You can return to your cart to try again.
            </p>
            <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold">
                Return to Home
            </Link>
        </div>
    );
}
