import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt"; // This is used to optionally get a user session
import axios, { AxiosError } from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    try {
        // We check for a token, but it is now optional. This allows us to
        // associate the purchase with a user if they are logged in.
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

        const { paymentMethod } = await request.json();

        if (!paymentMethod || (paymentMethod !== 'STRIPE' && paymentMethod !== 'PAYPAL')) {
            return NextResponse.json({ message: 'A valid payment method (STRIPE or PAYPAL) is required.' }, { status: 400 });
        }
        
        // The payload now includes the userId if the user is logged in, otherwise it's null.
        // Your main backend API must be able to handle a null userId.
        const payload = { 
            userId: token ? token.sub : null, 
            currency: paymentMethod,
            status: 'NOTSTARTED'
        };

        // The Authorization header is removed from this call. The corresponding endpoint
        // on your main backend API must now be public.
        const response = await axios.post(`${NEXT_PUBLIC_API_BASE_URL}/Purchase/createPurchase`, payload);

        // Return the response from your main backend, which should include the new purchaseId.
        return NextResponse.json(response.data);

    } catch (e) {
        console.error("API route /api/db/purchase error:", e);

        if (axios.isAxiosError(e)) {
            const err = e as AxiosError;
            return NextResponse.json(
                { message: err.message, details: err.response?.data },
                { status: err.response?.status || 500, statusText: "API call failed" }
            );
        }

        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}