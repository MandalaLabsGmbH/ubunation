import { NextResponse, NextRequest } from "next/server";
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
    try {
        const { cart, purchaseId } = await request.json();

        if (!cart || cart.length === 0) {
            return NextResponse.json({ message: 'Shopping cart is empty.' }, { status: 400 });
        }
        if (!purchaseId) {
            return NextResponse.json({ message: 'A purchase ID is required.' }, { status: 400 });
        }
        
        if (!API_BASE_URL) {
            throw new Error("API_BASE_URL is not configured.");
        }

        const payload = { 
            cart: cart,
            purchaseId: purchaseId 
        };

        const stripeLambdaUrl = `${API_BASE_URL}/PurchaseProcess/create_stripe_payment_intent`;

        const lambdaResponse = await axios.post(stripeLambdaUrl, payload);

        return NextResponse.json(lambdaResponse.data);

    } catch (error) {
        console.error("API route /api/purchase/stripe encountered an error:", error);
        if (axios.isAxiosError(error)) {
            const errorMessage = (error.response?.data as { message?: string })?.message || error.message;
            return NextResponse.json({ message: `Backend Error: ${errorMessage}` }, { status: 500 });
        }
        const errorMessage = error instanceof Error ? error.message : 'An unknown internal server error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
