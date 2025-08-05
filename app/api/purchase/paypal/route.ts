import { NextResponse, NextRequest } from "next/server";
import axios from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    try {
        const { cart, purchaseId, email } = await request.json();

       if (!cart || !purchaseId) {
            return NextResponse.json({ message: 'Cart and Purchase ID are required.' }, { status: 400 });
        }
        
        if (!NEXT_PUBLIC_API_BASE_URL) {
            throw new Error("API_BASE_URL is not configured.");
        }

        const payload = {  
            cart: cart,
            purchaseId: purchaseId,
            email
        };

        const paypalLambdaUrl = `${NEXT_PUBLIC_API_BASE_URL}/PurchaseProcess/create_paypal_order`;
        const lambdaResponse = await axios.post(paypalLambdaUrl, payload);

        return NextResponse.json(lambdaResponse.data);

    } catch (error) {
        console.error("API route /api/purchase/paypal error:", error);
        const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}