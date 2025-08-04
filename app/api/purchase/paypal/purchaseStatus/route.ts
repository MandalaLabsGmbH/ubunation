import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// This function fetches the status of a single purchase.
export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        // This endpoint is only for logged-in users to check their own purchases.
        if (!token?.accessToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const purchaseId = searchParams.get("purchaseId");

        if (!purchaseId) {
            return NextResponse.json({ message: 'purchaseId is required' }, { status: 400 });
        }

        const response = await axios.get(`${API_BASE_URL}/Purchase/getPurchaseByPurchaseId`, {
            params: { purchaseId: parseInt(purchaseId) },
            headers: {
                'Authorization': `Bearer ${token.accessToken}`
            }
        });

        // We only need to return the status for this polling mechanism.
        return NextResponse.json({ status: response.data.status });

    } catch (e) {
        console.error("API route /api/paypal/purchaseStatus error:", e);
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
