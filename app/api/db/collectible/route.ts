import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        const { searchParams } = new URL(request.url);
        const collectibleId = searchParams.get("collectibleId");
        const collectionId = searchParams.get("collectionId");
        const getMyCollectibles = searchParams.get("myCollectibles"); // New parameter

        // Case 1: Fetch all collectibles for the logged-in user
        if (getMyCollectibles === 'true') {
            if (!token?.accessToken || !token.email) {
                return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
            }

            const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail`, {
                params: { email: token.email },
                headers: { 'Authorization': `Bearer ${token.accessToken}` }
            });
            const userId = userResponse.data.userId;

            if (!userId) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            const userCollectiblesResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/UserCollectible/getUserCollectiblesByOwnerId`, {
                params: { ownerId: userId },
                headers: { 'Authorization': `Bearer ${token.accessToken}` }
            });
            const userCollectibles = userCollectiblesResponse.data;

            if (!userCollectibles || userCollectibles.length === 0) {
                return NextResponse.json([]);
            }

            const enrichedCollectibles = await Promise.all(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                userCollectibles.map(async (userCollectible: any) => {
                    try {
                        const collectibleResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                            params: { collectibleId: userCollectible.collectibleId },
                            headers: { 'Authorization': `Bearer ${token.accessToken}` }
                        });
                        return { ...userCollectible, collectible: collectibleResponse.data };
                    } catch (enrichError) {
                        console.error(`Failed to enrich userCollectible ${userCollectible.userCollectibleId}:`, enrichError);
                        return null;
                    }
                })
            );

            const finalCollectibles = enrichedCollectibles.filter(item => item !== null);
            return NextResponse.json(finalCollectibles);
        }

        // Case 2: Fetch a single collectible by its ID.
        if (collectibleId) {
            const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                params: { collectibleId }
            });
            return NextResponse.json(response.data);
        }
        
        // Case 3: Fetch all collectibles in a collection.
        if (collectionId) {
            const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/Collectible/getCollectiblesByCollection`, {
                params: { collectionId }
            });
            return NextResponse.json(response.data);
        }
        
        // Default Case: Fetch ALL collectibles if no specific ID is provided.
        const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/Collectible/getAllCollectibles`);
        return NextResponse.json(response.data);

    } catch (e) {
        console.error("API route /api/db/collectible error:", e);
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
