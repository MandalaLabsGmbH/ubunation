import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.idToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userCollectibleId = searchParams.get("userCollectibleId");

        // The Fix: Check if a specific userCollectibleId is being requested.
        if (userCollectibleId) {
            // This is the call made by the purchases modal.
            const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, {
                params: { userCollectibleId: parseInt(userCollectibleId) },
                headers: { 'Authorization': `Bearer ${token.idToken}` }
            });
            return NextResponse.json(response.data);
        }

        // This is the original logic, which can be kept as a fallback for other use cases.
        const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail`, {
            params: { email: token.email },
            headers: { 'Authorization': `Bearer ${token.idToken}` }
        });
        const userId = userResponse.data.userId;

        if (!userId) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        
        const userCollectibleResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/UserCollectible/getUserCollectiblesByOwnerId`, {
            params: { ownerId: userId },
            headers: { 'Authorization': `Bearer ${token.idToken}` }
        });

        // This original response seems specific, so we'll return the full data for flexibility.
        return NextResponse.json(userCollectibleResponse.data);

    } catch (e) {
        console.error("API route /api/db/userCollectible error:", e);
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

// POST function remains the same
export async function POST(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.idToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { userId, collectibleId, mint } = await request.json();
        
        await axios.post(`${NEXT_PUBLIC_API_BASE_URL}/UserCollectible/createUserCollectible`, {
            "ownerId": userId,
            "collectibleId": collectibleId,
            "mint": mint
        }, {
            headers: { 'Authorization': `Bearer ${token.idToken}` }
        });

        return NextResponse.json({ message: 'success' });
    } catch (e) {
        console.log({ e });
        const err = e as AxiosError;
        return NextResponse.json({ message: e }, { status: err.status, statusText: "invalid database call" });
    }
}
