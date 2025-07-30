import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios from 'axios';

const CREATE_PAYPAL_ORDER_URL = process.env.NEXT_PUBLIC_CREATE_PAYPAL_ORDER_LAMBDA_URL;
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        let userId: number = 1; // Default to guest user ID

        // If the user is logged in, fetch their internal database ID
        if (token && token.email && token.accessToken) {
            try {
                const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail?email=${token.email}`, {
                    headers: { 'Authorization': `Bearer ${token.accessToken}` }
                });
                if (userResponse.data && userResponse.data.userId) {
                    userId = userResponse.data.userId;
                }
            } catch (error) {
                console.error("Could not fetch user by email, proceeding as guest. Error:", error);
                // userId remains 1
            }
        }

        const { cart, purchaseId } = await request.json();

        if (!cart || cart.length === 0) {
            return NextResponse.json({ message: 'Shopping cart is empty.' }, { status: 400 });
        }
        if (!purchaseId) {
            return NextResponse.json({ message: 'A purchase ID is required.' }, { status: 400 });
        }
        
        if (!CREATE_PAYPAL_ORDER_URL) {
            throw new Error("PayPal Lambda URL is not configured.");
        }

        const payload = { 
            userId: userId, 
            cart: cart,
            purchaseId: purchaseId
        };

        const lambdaResponse = await axios.post(CREATE_PAYPAL_ORDER_URL, payload);

        return NextResponse.json(lambdaResponse.data);

    } catch (error) {
        console.error("API route /api/purchase/paypal error:", error);
        const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}