import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        let userId: number = 1; // Default to guest user ID

        // If the user is logged in, fetch their internal database ID
        if (token && token.email && token.accessToken) {
            try {
                const userResponse = await axios.get(`${API_BASE_URL}/User/getUserByEmail?email=${token.email}`, {
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

        const { paymentMethod } = await request.json();

        if (!paymentMethod || (paymentMethod !== 'STRIPE' && paymentMethod !== 'PAYPAL')) {
            return NextResponse.json({ message: 'A valid payment method (STRIPE or PAYPAL) is required.' }, { status: 400 });
        }
        
        const payload = { 
            userId: userId, 
            currency: paymentMethod,
            status: 'NOTSTARTED'
        };

        const response = await axios.post(`${API_BASE_URL}/Purchase/createPurchase`, payload);

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