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
        const purchaseId = searchParams.get("purchaseId");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let purchaseItems: any[] = [];

        // Case 1: Fetch by a specific purchaseId (for the receipts modal)
        if (purchaseId) {
            const itemsResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/PurchaseItem/getPurchaseItemsByPurchaseId`, {
                params: { purchaseId: parseInt(purchaseId) },
                headers: { 'Authorization': `Bearer ${token.idToken}` }
            });
            purchaseItems = itemsResponse.data;
        } 
        // Case 2: Fetch all items for the logged-in user (for the profile page)
        else if (token.email) {
            const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail`, {
                params: { email: token.email },
                headers: { 'Authorization': `Bearer ${token.idToken}` }
            });
            const userId = userResponse.data.userId;

            if (!userId) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            const purchasesResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/Purchase/getPurchasesByUserId`, {
                params: { userId: userId },
                headers: { 'Authorization': `Bearer ${token.idToken}` }
            });
            const userPurchases = purchasesResponse.data;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const itemPromises = userPurchases.map((purchase: any) => 
                axios.get(`${NEXT_PUBLIC_API_BASE_URL}/PurchaseItem/getPurchaseItemsByPurchaseId`, {
                    params: { purchaseId: purchase.purchaseId },
                    headers: { 'Authorization': `Bearer ${token.idToken}` }
                }).then(res => res.data)
            );
            
            const nestedItems = await Promise.all(itemPromises);
            purchaseItems = nestedItems.flat();

        } else {
            return NextResponse.json({ message: 'A purchaseId or user session is required' }, { status: 400 });
        }

        // Enrich the data by fetching full details for each item.
        const enrichedItems = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            purchaseItems.map(async (item: any) => {
                try {
                    const collectibleResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                        params: { collectibleId: item.itemId },
                        headers: { 'Authorization': `Bearer ${token.idToken}` }
                    });

                    let userCollectibleData = null;
                    if (item.purchasedUserItemId) {
                        const userCollectibleResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, {
                            params: { userCollectibleId: item.purchasedUserItemId },
                            headers: { 'Authorization': `Bearer ${token.idToken}` }
                        });
                        userCollectibleData = Array.isArray(userCollectibleResponse.data) ? userCollectibleResponse.data[0] : userCollectibleResponse.data;
                    }

                    return {
                        ...item,
                        collectible: collectibleResponse.data,
                        userCollectible: userCollectibleData
                    };
                } catch (enrichError) {
                    console.error(`Failed to enrich item ${item.purchaseItemId}:`, enrichError);
                    // The Fix: Return the item without enrichment if an error occurs,
                    // preventing the entire request from crashing.
                    return { ...item, collectible: null, userCollectible: null };
                }
            })
        );
        
        // Filter out any items that completely failed to load essential data
        const finalItems = enrichedItems.filter(item => item.collectible);

        return NextResponse.json(finalItems);

    } catch (e) {
        console.error("API route /api/db/purchaseItems error:", e);
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
