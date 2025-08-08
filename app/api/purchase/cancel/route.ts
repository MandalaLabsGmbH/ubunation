import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// This function handles the cancellation of an unfulfilled purchase.
export async function POST(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        // A user must be logged in to cancel their own purchase.
        if (!token?.idToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { purchaseId } = await request.json();

        if (!purchaseId) {
            return NextResponse.json({ message: 'purchaseId is required' }, { status: 400 });
        }
        
        if (!API_BASE_URL) {
            throw new Error("API_BASE_URL is not configured.");
        }

        // This call assumes your backend has a new endpoint to handle cancellations.
        const response = await axios.post(`${API_BASE_URL}/PurchaseProcess/cancelOrRefundPurchase`, 
            { purchaseId }, 
            {
                headers: { 'Authorization': `Bearer ${token.idToken}` }
            }
        );

        return NextResponse.json(response.data);

    } catch (e) {
        console.error("API route /api/purchase/cancel error:", e);
        if (axios.isAxiosError(e)) {
            const err = e as AxiosError;
            return NextResponse.json(
                { message: err.message, details: err.response?.data },
                { status: err.response?.status || 500 }
            );
        }
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
