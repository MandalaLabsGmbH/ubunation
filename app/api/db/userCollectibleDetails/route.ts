import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// This function fetches all the necessary details for a single user collectible page.
export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.idToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userCollectibleId = searchParams.get("id");

        if (!userCollectibleId) {
            return NextResponse.json({ message: 'userCollectibleId is required' }, { status: 400 });
        }

        // 1. Fetch the core UserCollectible object
        const userCollectibleResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, {
            params: { userCollectibleId },
            headers: { 'Authorization': `Bearer ${token.idToken}` }
        });
        const userCollectible = Array.isArray(userCollectibleResponse.data) ? userCollectibleResponse.data[0] : userCollectibleResponse.data;
        if (!userCollectible) {
            throw new Error('User collectible not found');
        }

        // 2. Fetch the associated Collectible and User data in parallel
        const [collectibleResponse, ownerResponse] = await Promise.all([
            axios.get(`${NEXT_PUBLIC_API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                params: { collectibleId: userCollectible.collectibleId },
                headers: { 'Authorization': `Bearer ${token.idToken}` }
            }),
            axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByUserId`, {
                params: { userId: userCollectible.ownerId },
                headers: { 'Authorization': `Bearer ${token.idToken}` }
            })
        ]);

        // 3. Combine all data into a single response object
        const responseData = {
            userCollectible: userCollectible,
            collectible: collectibleResponse.data,
            owner: ownerResponse.data
        };

        return NextResponse.json(responseData);

    } catch (e) {
        console.error("API route /api/db/userCollectibleDetails error:", e);
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
